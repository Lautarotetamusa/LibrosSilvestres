import supertest from 'supertest';

import {app} from '../src/app.js'

import {Persona} from '../src/models/persona.model.js'

import fs from "fs"

const requestWithSupertest = supertest(app);

const rawdata = fs.readFileSync("tests/persona.test.json");
const tests = JSON.parse(rawdata);

// Use the app object in your tests
describe('Obtener personas GET /persona', function () {
    tests.get.forEach(test => {
        it(test.title, function (done) {
            supertest(app)
            .get(test.url)
            .expect(test.code, done);
        });
    });
  });

describe('Crear persona POST /persona', function () {
    tests.post.forEach(test => {
        it(test.title, function (done) {
            if ('expect' in test)
                supertest(app)
                    .post('/persona')
                    .send(test.data)
                    .expect(test.code, test.expect, done);
            else
                supertest(app)
                    .post('/persona')
                    .send(test.data)
                    .expect(test.code, done);
        });
    });
});

