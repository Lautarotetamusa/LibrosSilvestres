import {conn} from '../db.js'

import { NotFound, ValidationError } from './errors.js';

const table_name = 'consignaciones'

export class Consignacion{
    constructor(request){
        this.cliente = request.cliente;
        this.libros  = request.libros;

        let date = new Date().toISOString()
            .replace(/\..+/, '')     //delete the . and everything after;
            .replace(/T/, '_')       //replace T with a space
            .replaceAll('-', '_')
            .replaceAll(':', '');

        this.path = `${date}_${this.cliente.cuit}.pdf`; 
    }

    static validate(request){
        if (!('cliente' in request))
            throw new NotFound('el id del cliente es obligatorio');    

        if(!request.libros)
            throw new ValidationError('La consignacion necesita al menos un libro');
    }
    
    async insert(){
        this.id = (await conn.query(`

            INSERT INTO ${table_name}
            SET id_cliente = ${this.cliente.id},
            remito_path = '${this.path}'

        `))[0].insertId;

        let libros_consignaciones = this.libros.map(l => [this.id, l.cantidad, l.isbn]);

        await conn.query(`

            INSERT INTO libros_consignaciones
                (id_consignacion, stock, isbn)
            VALUES ? 

        `, [libros_consignaciones]);

        let stock_clientes = this.libros.map(l => [this.cliente.id, l.cantidad, l.isbn])
        await conn.query(`

            INSERT INTO stock_cliente
                (id_cliente, stock, isbn)
                VALUES ?
            ON DUPLICATE KEY UPDATE
                stock = stock + VALUES(stock)

        `, [stock_clientes]);
    }
}
