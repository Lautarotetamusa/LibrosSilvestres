import request from 'supertest';

import chai from 'chai';

//import {app} from '../src/app.js'

import {Persona} from '../src/models/persona.model.js'

import {conn} from '../src/db.js'

import fs from "fs"

const rawdata = fs.readFileSync("tests/persona.test.json");
const tests = JSON.parse(rawdata);

let persona = {}
const app = 'http://localhost:3000'

/*
    - Creamos dos personas, una con dni 43491979 y otra 43491980
    - Intentamos crear otra con el mismo dni y obtenemos un error
    - Obtenemos una persona con un id q no existe y nos da un error
    - Verificamos que la persona creada esté en la lista
    - Intentamos actualizar la persona 1 al dni de la persona 2 y obtenemos un error
    - Actualizamos la persona
    - Intentamos borrar una persona que no existe, obtenemos un error
    - Borramos la persona 1
    - Verificamos que ya no esté en la lista
    - Hard delete de las dos personas para evitar que queden en la DB.
*/

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

    it('Sin dni', async () => {
        const res = await request(app)
            .post('/persona/')
            .send(persona);
        
        persona.dni = '43491979';
        
        chai.expect(res.status).to.equal(400);
        chai.expect(res.body.success).to.be.false;
        chai.expect(res.body.error).to.exist;
    });


    it('Success', async () => {
        const res = await request(app)
            .post('/persona/')
            .send(persona);

        // Creo otra persona para despues
        persona.dni = '43491980';
        await request(app)
            .post('/persona/')
            .send(persona);

        persona.dni = '43491979';
        persona.id = res.body.data.id;
        
        chai.expect(res.status).to.equal(201);
        chai.expect(res.body.data).to.deep.include(persona);
        chai.expect(res.body.success).to.be.true;
    });

    it('Dni repetido', async () => {
        const res = await request(app)
            .post('/persona/')
            .send(persona);
        
        chai.expect(res.status).to.equal(404);
        chai.expect(res.body.success).to.be.false;
        chai.expect(res.body.error).to.exist;
    });
});


describe('GET persona/', () => {
    it('Persona que no existe', async () => {
        const res = await request(app).get('/persona/'+(persona.id+2));

        chai.expect(res.status).to.equal(404);
        chai.expect(res.body.success).to.be.false;
        chai.expect(res.body.error).to.exist;
    });

    it('Obtener persona', async () => {
        const res = await request(app).get('/persona/'+persona.id);

        chai.expect(res.status).to.equal(200);
        chai.expect(res.body).to.deep.include(persona);
    });

    it('La persona está en la lista', async () => {
        const res = await request(app).get('/persona/');

        chai.expect(res.status).to.equal(200);
        chai.expect(res.body.map(p => p.id)).to.deep.include(persona.id);
    });
});

describe('PUT persona/{id}', () => {
    it('Nothing changed', async () => {
        delete persona.dni;
        const res = await request(app)
            .put('/persona/'+persona.id)
            .send(persona);

        chai.expect(res.status).to.equal(200);
    });

    it('Actualizar a un dni que ya está cargado', async () => {
        persona.dni = '43491980';
        const res = await request(app)
            .put('/persona/'+persona.id)
            .send(persona);

        chai.expect(res.status).to.equal(404);
        chai.expect(res.body.success).to.be.false;
        chai.expect(res.body.error).to.exist;
    });

    it('Success', async () => {
        delete persona.dni;
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
        const res = await request(app).get('/persona/'+(persona.id+2));

        chai.expect(res.status).to.equal(404);
        chai.expect(res.body.success).to.be.false;
        chai.expect(res.body.error).to.exist;
    });
    
    it('Success', async () => {
        const res = await request(app).delete('/persona/'+persona.id);

        chai.expect(res.status).to.equal(200);
    });

    it('La persona ya no está en la lista', async () => {
        const res = await request(app).get('/persona/');

        chai.expect(res.status).to.equal(200);
        chai.expect(res.body.map(p => p.id)).to.not.include(persona.id);
    });

    it('HARD DELETE', async () => {
        await conn.query(`
            DELETE FROM personas
            WHERE dni=43491979
            OR dni=43491980
        `);
    });
    
  });
