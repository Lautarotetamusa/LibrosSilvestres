import request from 'supertest';

import chai, { expect } from 'chai';

//import {app} from '../src/app.js'

import fs from "fs"
import { log } from 'console';

const app = 'http://localhost:3000'

const rawdata = fs.readFileSync("tests/libro.test.json");
const tests = JSON.parse(rawdata);


let libro = {
    "isbn": "1234567891017",
    "titulo": "Test",
    "fecha_edicion": "2020-02-17",
    "precio": 10000
}

describe('Crear libro POST /libro', function () {
    describe('Errores', function () {
        tests.forEach(test => {
            it(test.title, function (done) {
                request(app)
                    .post('/libro')
                    .send(test.data)
                    .end((err, res) => {
                        chai.expect(res.status).to.equal(test.code);
                        chai.expect(res.body).to.be.a('object');
                        chai.expect(res.body).to.have.property('success');
                        chai.expect(res.body).to.have.property('error');
                        chai.expect(res.body.success).to.be.false;
                    done();
                  });
            });
        });
    });
    

    it('Success', async () => {

        //Set random isbn
        libro.isbn = "111111"

        //Get real persons from the table
        let autor      = (await request(app).get('/persona/autor')).body.at(-1);
        let ilustrador = (await request(app).get('/persona/ilustrador')).body.at(-1);

        libro.autores = [autor, {
            nombre: "TestAutor"
        }];
        libro.ilustradores = [ilustrador, {
            nombre: "TestIlustrador"
        }];

        const res = await request(app)
            .post('/libro/')
            .send(libro);
        
        chai.expect(res.status).to.equal(201);
        chai.expect(res.body).to.be.a('object');
        chai.expect(res.body.success).to.be.true;
    });

    it('Las personas tienen el libro asignado', async () => {

        let autor       = (await request(app).get('/persona/autor/'+libro.autores[0].id)).body;
        let ilustrador  = (await request(app).get('/persona/ilustrador/'+libro.ilustradores[0].id)).body;

        //Revisar que los autores e ilustradores tengan ese libro asociado
        chai.expect(     autor.libros.map(l => l.isbn)).to.deep.include(libro.isbn);
        chai.expect(ilustrador.libros.map(l => l.isbn)).to.deep.include(libro.isbn);
    });
});

describe('DELETE /libro', function () {
    it('Borrado', async () => {
        const res = await request(app).delete('/libro/'+libro.isbn);

        console.log(res.body);

        chai.expect(res.status).to.equal(200);
        chai.expect(res.body).to.have.property('success');
        chai.expect(res.body.success).to.be.true;
    });

    it('No se puede obtener el libro', async () => {
        const res = await request(app).get('/libro/'+libro.isbn);

        chai.expect(res.status).to.equal(404);
        chai.expect(res.body).to.have.property('success');
        chai.expect(res.body.success).to.be.false;
    });

    it('Las personas no tienen más el libro asignado', async () => {

        let autor       = (await request(app).get('/persona/autor/'+libro.autores[0].id)).body;
        let ilustrador  = (await request(app).get('/persona/ilustrador/'+libro.ilustradores[0].id)).body;

        //Revisar que los autores e ilustradores tengan ese libro asociado
        chai.expect(     autor.libros.map(l => l.isbn)).to.not.deep.include(libro.isbn);
        chai.expect(ilustrador.libros.map(l => l.isbn)).to.not.deep.include(libro.isbn);
    });
});


describe('Listar todos los libros GET /libro', function () {
    it("Lista obtenida", function (done) {
        request(app)
        .get('/libro')
        .expect(200, done)
    });
});

describe('Obtener libro GET /libro/:isbn', function () {
    it("Libro obtenido", function (done) {
        request(app)
        .get('/libro/1234567891019')
        .expect(200, done)
    });
});