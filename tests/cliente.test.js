import request from 'supertest';

import chai from 'chai';

import {Cliente} from '../src/models/cliente.model.js'

import {conn} from '../src/db.js'

let cliente = {}
const app = 'http://localhost:3000'

/*
    - Creamos dos clientes, una con cuit 11111111 y otra 22222222
    - Intentamos crear otra con el mismo cuit y obtenemos un error
    - Obtenemos una cliente con un id q no existe y nos da un error
    - Verificamos que la cliente creada esté en la lista
    - Intentamos actualizar la cliente 1 al cuit de la cliente 2 y obtenemos un error
    - Actualizamos la cliente
    - Intentamos borrar una cliente que no existe, obtenemos un error
    - Borramos la cliente 1
    - Verificamos que ya no esté en la lista
    - Hard delete de las dos clientes para evitar que queden en la DB.
*/

describe('POST cliente/', () => {
    it('Sin nombre', async () => {
        const res = await request(app)
            .post('/cliente/')
            .send(cliente);
        
        cliente.nombre = 'Test';
        cliente.email = 'test@gmail.com';
        
        chai.expect(res.status).to.equal(400);
        chai.expect(res.body.success).to.be.false;
        chai.expect(res.body.error).to.exist;
    });
    it('Sin cond fiscal', async () => {
        const res = await request(app)
            .post('/cliente/')
            .send(cliente);
        
        cliente.cond_fiscal = 5;
        
        chai.expect(res.status).to.equal(400);
        chai.expect(res.body.success).to.be.false;
        chai.expect(res.body.error).to.exist;
    });
    it('Sin tipo', async () => {
        const res = await request(app)
            .post('/cliente/')
            .send(cliente);
        
        cliente.tipo = 1;
        
        chai.expect(res.status).to.equal(400);
        chai.expect(res.body.success).to.be.false;
        chai.expect(res.body.error).to.exist;
    });

    it('Sin cuit', async () => {
        const res = await request(app)
            .post('/cliente/')
            .send(cliente);
        
        cliente.cuit = 11111111;
        
        chai.expect(res.status).to.equal(400);
        chai.expect(res.body.success).to.be.false;
        chai.expect(res.body.error).to.exist;
    });


    it('Success', async () => {
        const res = await request(app)
            .post('/cliente/')
            .send(cliente);

        // Creo otra cliente para despues
        cliente.cuit = 22222222;
        let a = await request(app)
            .post('/cliente/')
            .send(cliente);
        //console.log("segundo cliente:", a.body.data);

        //console.log(res.body);
        cliente.cuit = 11111111;
        cliente.id = res.body.data.id;
        
        chai.expect(res.status).to.equal(201);
        chai.expect(res.body.data).to.deep.include(cliente);
        chai.expect(res.body.success).to.be.true;
    });

    it('cuit repetido', async () => {
        const res = await request(app)
            .post('/cliente/')
            .send(cliente);
        
        chai.expect(res.status).to.equal(404);
        chai.expect(res.body.success).to.be.false;
        chai.expect(res.body.error).to.exist;
    });
});


describe('GET cliente/', () => {
    it('cliente que no existe', async () => {
        const res = await request(app).get('/cliente/'+(cliente.id+2));

        chai.expect(res.status).to.equal(404);
        chai.expect(res.body.success).to.be.false;
        chai.expect(res.body.error).to.exist;
    });

    it('Obtener cliente', async () => {
        const res = await request(app).get('/cliente/'+cliente.id);
        //console.log(res.body);
        chai.expect(res.status).to.equal(200);
        chai.expect(res.body).to.deep.include(cliente);
    });

    it('La cliente está en la lista', async () => {
        const res = await request(app).get('/cliente/');
        
        chai.expect(res.status).to.equal(200);
        chai.expect(res.body.map(p => p.id)).to.deep.include(cliente.id);
    });
});

describe('PUT cliente/{id}', () => {
    it('Nothing changed', async () => {
        delete cliente.cuit;
        const res = await request(app)
            .put('/cliente/'+cliente.id)
            .send(cliente);

        chai.expect(res.status).to.equal(200);
    });

    it('Actualizar a un cuit que ya está cargado', async () => {
        cliente.cuit = 22222222;
        //console.log("update:", cliente);
        const res = await request(app)
            .put('/cliente/'+cliente.id)
            .send(cliente);
        //console.log(res.body);
        chai.expect(res.status).to.equal(404);
        chai.expect(res.body.success).to.be.false;
        chai.expect(res.body.error).to.exist;
    });

    it('Success', async () => {
        cliente.cuit=33333333
        cliente.nombre = 'TestTest';
        cliente.este_campo_no_va = "anashe23";

        const res = await request(app)
            .put('/cliente/'+cliente.id)
            .send(cliente);
        console.log(res.body);
        delete cliente.este_campo_no_va;
        res.body.data.id = cliente.id;
        chai.expect(res.status).to.equal(201);
        chai.expect(res.body.data).to.deep.include(cliente);
    });

})

describe('DELETE /cliente/{id}', () => {
    it('cliente no existe', async () => {
        const res = await request(app).get('/cliente/'+(cliente.id+2));

        chai.expect(res.status).to.equal(404);
        chai.expect(res.body.success).to.be.false;
        chai.expect(res.body.error).to.exist;
    });
    
    it('Success', async () => {
        const res = await request(app).delete('/cliente/'+cliente.id);

        chai.expect(res.status).to.equal(200);
    });

    it('La cliente ya no está en la lista', async () => {
        const res = await request(app).get('/cliente/');
        //console.log(res.body, "cliente id ", cliente.id);
        chai.expect(res.status).to.equal(200);
        chai.expect(res.body.map(p => p.id)).to.not.include(cliente.id);
    });

    it('HARD DELETE', async () => {
        await conn.query(`
            DELETE FROM clientes
            WHERE cuit=33333333
            OR cuit=22222222
        `);
    });
  });
