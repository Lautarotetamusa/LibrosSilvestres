import {conn} from '../db.js'
import { Libro } from './libro.model.js';

import { NotFound, ValidationError } from './errors.js';

const table_name = 'ventas'

export class Venta{
    constructor(request){

        if (!('medio_pago' in request))
            throw new ValidationError('El medio de pago es obligatorio para la Venta')

        if(!request.libros)
            throw new ValidationError('La Venta necesita al menos un libro')

        if(!request.cliente)
            throw new ValidationError('La Venta necesita un cliente')

        if(!(Object.keys(Venta.medios_pago)[request.medio_pago]))
            throw new ValidationError('El medio de pago es incorrecto [0..4]')

        this.descuento  = request.descuento;
        this.cliente    = request.cliente;
        this.libros     = request.libros;
        this.medio_pago = request.medio_pago;
    }

    static medios_pago = {
        efectivo: 0,
        debito: 1,
        credito: 2,
        mercadopago: 3,
        transferencia: 4,
    }

    static str_medios_pago = [
        "efectivo",
        "debito",
        "credito",
        "mercadopago",
        "transferencia"
    ]

    async insert(){
        this.total = this.libros.reduce((acumulador, libro) => 
            acumulador + libro.cantidad * libro.precio
        , 0);
        console.log("total:", this.total);

        let venta = (await conn.query(`
            INSERT INTO ${table_name}
                (id_cliente, descuento, medio_pago, total) 
            VALUES 
                (${this.cliente.id}, ${this.descuento}, ${this.medio_pago}, ${this.total})
        `))[0];

        let libros_venta = this.libros.map(l => [venta.insertId, l.cantidad, l.isbn, l.precio]);
        console.log(libros_venta);

        /*for (let i in this.libros) {
            //let libro = await Libro.get_by_isbn(this.libros[i].isbn);
            //console.log("new stock", this.libros[i].stock - this.libros[i].cantidad);
            
        }*/

        await conn.query(`
            INSERT INTO libros_ventas
                (id_venta, cantidad, isbn, precio_venta)
            VALUES ? 
        `, [libros_venta]);
    }

    static async get_by_id(id){
        let res = (await conn.query(`
            SELECT * FROM ventas
            WHERE id=${id}
        `))[0];

        if (res.length <= 0)
            throw new NotFound(`No se encontro la venta con id ${id}`)

        let venta = res[0];

        let libros = (await conn.query(`
            SELECT libros.isbn, titulo, cantidad, precio_venta 
            FROM libros
            INNER JOIN libros_ventas
                ON libros_ventas.isbn = libros.isbn
            INNER JOIN ventas
                ON ventas.id = libros_ventas.id_venta
            WHERE ventas.id = ${id}
        `))[0];

        let clientes = (await conn.query(`
            SELECT cuit, nombre, email, tipo, cond_fiscal FROM clientes
            INNER JOIN ventas
                ON ventas.id_cliente = clientes.id
            WHERE ventas.id = ${id}
        `))[0];

        console.log(libros);
        console.log(clientes);

        venta.libros = libros;
        venta.clientes = clientes;
        return venta;
    }

    static async get_all(){
        return (await conn.query(`
            SELECT 
                libros.isbn, titulo, cantidad, precio_venta, 
                fecha, medio_pago, total, 
                cuit, nombre as nombre_cliente, email, cond_fiscal, tipo
            FROM libros
            INNER JOIN libros_ventas
                ON libros_ventas.isbn = libros.isbn
            INNER JOIN ventas
                ON ventas.id = libros_ventas.id_venta
            INNER JOIN clientes
                ON ventas.id_cliente = clientes.id
        `))[0];
    }

    static async get_by_isbn(isbn){
        let ventas = (await conn.query(`
            SELECT 
                libros.isbn, titulo, cantidad, precio_venta, 
                fecha, medio_pago, total, 
                cuit, nombre as nombre_cliente, email, cond_fiscal, tipo
            FROM libros
            INNER JOIN libros_ventas
                ON libros_ventas.isbn = libros.isbn
            INNER JOIN ventas
                ON ventas.id = libros_ventas.id_venta
            INNER JOIN clientes
                ON ventas.id_cliente = clientes.id
            WHERE libros.isbn = ${isbn}
        `))[0];

        return ventas;
    }
}
