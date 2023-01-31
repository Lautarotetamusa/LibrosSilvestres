import {conn} from '../db.js'
import { Libro } from './libro.model.js';


class ValidationError extends Error {
    constructor(message){
        super(message);
        this.name = "ValidationError";
        this.status_code = 400;
    }
}
class NotFound extends Error {
    constructor(message){
        super(message);
        this.name = "NotFound";
        this.status_code = 404;
    }
}
class NothingChanged extends Error {
    constructor(message){
        super(message);
        this.name = "NothingChanged";
        this.status_code = 200;
    }
}

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

    async insert(){

        let total = this.libros.reduce((acumulador, libro) => 
            acumulador + libro.cantidad * libro.precio
        , 0);
        console.log(total);

        let venta = (await conn.query(`
            INSERT INTO ${table_name}
                (id_cliente, descuento, medio_pago, total) 
            VALUES 
                (${this.cliente.id}, ${this.descuento}, ${this.medio_pago}, ${total})
        `))[0];

        let libros_venta = this.libros.map(l => [venta.insertId, l.cantidad, l.isbn]);
        console.log(libros_venta);

        for (let i in this.libros) {
            Libro.update(this.libros[i].isbn, {
                stock: this.libros[i].stock - this.libros[i].cantidad
            })
        }

        await conn.query(`
            INSERT INTO libros_ventas
                (id_venta, cantidad, isbn)
            VALUES ? 
        `, [libros_venta]);
    }
}

Venta.ValidationError = ValidationError;
Venta.NotFound = NotFound;
Venta.NothingChanged = NothingChanged;
