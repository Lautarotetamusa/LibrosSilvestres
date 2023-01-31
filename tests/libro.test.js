import supertest from 'supertest';

import {app} from '../src/app.js'

import fs from "fs"

const requestWithSupertest = supertest(app);

const rawdata = fs.readFileSync("tests/libro.test.json");
const tests = JSON.parse(rawdata);

// Use the app object in your tests
describe('Crear libro POST /libro', function () {
    tests.forEach(test => {
        it(test.title, function (done) {
            supertest(app)
            .post('/libro')
            .send(test.data)
            .expect(test.code, test.expect, done);
        });
    });
  });

describe('Listar todos los libros GET /libro', function () {
    it("Lista obtenida", function (done) {
        supertest(app)
        .get('/libro')
        .expect(200, done)
    });
});

describe('Obtener libro GET /libro/:isbn', function () {
    it("Libro obtenido", function (done) {
        supertest(app)
        .get('/libro/1234567891019')
        .expect(200, done)
    });
});