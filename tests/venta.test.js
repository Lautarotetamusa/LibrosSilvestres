import request from 'supertest';
import chai, { assert } from 'chai';
import fs from 'fs';

import {conn} from '../src/db.js'

import { Venta } from '../src/models/venta.model.js';


const app = 'http://localhost:3000'

function expect_err_code(code, res){
    if(code != res.status)
        console.error(res.body);

    chai.expect(res.status).to.equal(code);
    chai.expect(res.body.success).to.be.false;
    chai.expect(res.body.error).to.exist;
}
function expect_success_code(code, res){
    if (code != res.status)
        console.error(res.body);

    chai.expect(res.status).to.equal(code);
    chai.expect(res.body.success).to.be.true;
    chai.expect(res.body.error).to.not.exist;
}

let cliente = {
    cuit: 20442317632,
    nombre: "ClienteTest",
    email: "clientetest@gmail.com",
    tipo: 1
}
let venta = {
    libros: [],
    medio_pago: Venta.str_medios_pago.length+1,
    descuento: 10
}

describe('VENTA', () => {
    after('delete cliente', async () => {
        /*Buscar los ids de los datos cargados*/
        let id_cliente = (await conn.query(`
            SELECT id FROM clientes
            WHERE cuit=${cliente.cuit}`
        ))[0][0].id;

        let id_venta = (await conn.query(`
            SELECT id FROM ventas
            WHERE id_cliente=${id_cliente};
        `))[0][0].id;

        /*Borrar de la base de datos*/
        await conn.query(`
            DELETE FROM libros_ventas
            WHERE id_venta=${id_venta};
        `);

        await conn.query(`
            DELETE FROM ventas
            WHERE id_cliente=${id_cliente};
        `);
        await conn.query(`
            DELETE FROM clientes
            WHERE id=${id_cliente};
        `);
    });

    describe('Cargar datos para la venta', () => {
        it('Crear nuevo cliente', async () => {
            const res = await request(app)
                .post('/cliente/')
                .send(cliente);

            //console.log(res.body);

            expect_success_code(201, res);

            cliente.id = res.body.data.id;
            venta.cliente = cliente.id;
        });

        it('Seleccionar libros para la venta', async () => {
            const res = await request(app).get('/libro?page=5');

            chai.expect(res.status).to.equal(200);
            venta.libros = [ res.body[3], res.body[5], res.body[8] ];
        });

        it('Agregar stock a los libros', async () => {

            let stock = 3;
            
            for (const libro of venta.libros) {
                let res = await request(app).put(`/libro/${libro.isbn}`)
                    .send({
                        stock: 0
                    });

                res = await request(app).put(`/libro/${libro.isbn}`)
                    .send({
                        stock: stock
                    });

                libro.cantidad = stock;

                expect_success_code(201, res);
            }

            for (const libro of venta.libros) {
                const res = await request(app).get(`/libro/${libro.isbn}`);

                chai.expect(res.status).to.equal(200);

                chai.expect(res.body.stock).to.equal(stock);
            }    
        });
    });

    describe('POST /venta', () => {
        describe('Errores', () => {
            it('Venta no tiene cliente', async () => {
                let aux_cliente = venta.cliente;
                delete venta.cliente;

                const res = await request(app).post('/venta/').send(venta);
                expect_err_code(400, res);

                venta.cliente = aux_cliente;
            });
            it('Medio de pago incorrecto', async () => {
                const res = await request(app).post('/venta/').send(venta);
                expect_err_code(400, res);
        
                venta.medio_pago = 0;
            });
            it('Un libro no tiene suficiente stock', async () => {
                venta.libros[2].cantidad = 5;

                const res = await request(app).post('/venta/').send(venta);
                expect_err_code(400, res);

                venta.libros[2].cantidad = 3;
            });
        });
        describe('Venta exitosa', () => {
            it('vender', async () => {
                const res = await request(app).post('/venta/').send(venta);
            
                expect_success_code(201, res);
            });
            
            it('Los libros reducieron su stock', async () => {
                for (const libro of venta.libros) {
                    const res = await request(app).get(`/libro/${libro.isbn}`);
        
                    chai.expect(res.status).to.equal(200);
                    chai.expect(res.body.stock).to.equal(0);
                }
            });
            it('El total de la venta está bien', async () => {
                let total = 0;
                for (const libro of venta.libros) {
                    total += libro.cantidad * libro.precio;
                }
                total -= total * venta.descuento * 0.01;
                total = parseFloat(total.toFixed(2));
                
                const res = await request(app).get(`/cliente/${cliente.id}/ventas/`);
            
                chai.expect(res.status).to.equal(200);
                venta = res.body[0];

                chai.expect(venta.total).to.equal(total);
            });
            it('La factura existe y el nombre coincide', async () => {       
                await delay(250);         
                fs.readFile(`facturas/${venta.file_path}`, 'utf8', (err, data) => {
                    if(err){
                        console.error(err);
                    }
                    chai.expect(err).to.not.exist;
                });
            });
        });
    });
});

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }