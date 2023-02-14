import request from 'supertest';

import chai from 'chai';

//import {app} from '../src/app.js'

import {Persona} from '../src/models/persona.model.js'

import fs from "fs"

const rawdata = fs.readFileSync("tests/persona.test.json");
const tests = JSON.parse(rawdata);

let persona = {}
const app = 'http://localhost:3001'

describe('POST persona/', () => {
    it('Sin nombre', async () => {
        const res = await request(app)
            .post('/persona/')
            .send(persona);
        
        persona.nombre = 'Test';
        persona.email = 'test@gmail.com'
        chai.expect(res.status).to.equal(400);
        chai.expect(res.body.success).to.be.false;
        chai.expect(res.body.error).to.exist;
    });

    it('Tipo equivocado', async () => {
        persona.tipo = 2;

        const res = await request(app)
            .post('/persona/')
            .send(persona);
        
        persona.tipo = 0;
        chai.expect(res.status).to.equal(400);
        chai.expect(res.body.success).to.be.false;
        chai.expect(res.body.error).to.exist;
    });


    it('Success', async () => {
        const res = await request(app)
            .post('/persona/')
            .send(persona);

        persona.id = res.body.data.id;
        
        chai.expect(res.status).to.equal(201);
        chai.expect(res.body.data).to.deep.include(persona);
        chai.expect(res.body.success).to.be.true;
    });
});


describe('GET persona/', () => {
    it('Persona que no existe', async () => {
        const res = await request(app).get('/persona/autor/'+(persona.id+1));

        chai.expect(res.status).to.equal(404);
        chai.expect(res.body.success).to.be.false;
        chai.expect(res.body.error).to.exist;
    });

    it('Obtener persona', async () => {
        const res = await request(app).get('/persona/autor/'+persona.id);

        chai.expect(res.status).to.equal(200);
        chai.expect(res.body).to.deep.include(persona);
    });

    it('La persona está en la lista', async () => {
        const res = await request(app).get('/persona/autor/');

        chai.expect(res.status).to.equal(200);
        chai.expect(res.body).to.deep.include(persona);
    });
});

describe('PUT persona/{id}', () => {
    it('Nothing changed', async () => {
        const res = await request(app)
            .put('/persona/'+persona.id)
            .send(persona);

        chai.expect(res.status).to.equal(200);
    });

    it('Success', async () => {
        persona.nombre = 'TestTest';

        const res = await request(app)
            .put('/persona/'+persona.id)
            .send(persona);

        res.body.data.id = persona.id;
        chai.expect(res.status).to.equal(201);
        chai.expect(res.body.data).to.deep.include(persona);
    });

})

describe('DELETE /persona/{id}', () => {
    it('Persona no existe', async () => {
        const res = await request(app).get('/persona/autor/'+(persona.id+1));

        chai.expect(res.status).to.equal(404);
        chai.expect(res.body.success).to.be.false;
        chai.expect(res.body.error).to.exist;
    });
    
    it('Success', async () => {
        const res = await request(app).delete('/persona/'+persona.id);

        chai.expect(res.status).to.equal(200);
    });

    it('La persona ya no está en la lista', async () => {
        const res = await request(app).get('/persona/autor/');

        chai.expect(res.status).to.equal(200);
        chai.expect(res.body).to.not.include(persona);
    });
  });


/*
describe('Obtener personas GET /persona', function () {
    
    tests.get.forEach(test => {
        
        it(test.title, async function () {
            const res = await request(app)
                .get(test.url);

            chai.expect(res.status).to.equal(test.code);
        });
    });
  });
describe('Crear persona POST /persona', function () {
    tests.post.forEach(test => {
        it(test.title, function (done) {
            if ('expect' in test)
                request(app)
                    .post('/persona')
                    .send(test.data)
                    .expect(test.code, test.expect)
                    .expect('Content-Type', '/json/', done);
            else
                request(app)
                    .post('/persona')
                    .send(test.data)
                    .expect(test.code, done);
        });
    });
});*/

