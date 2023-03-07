import {conn} from '../db.js'
import {ValidationError, NotFound, NothingChanged, Duplicated} from './errors.js';
import afip from "../facturacion/Afip.js"

const table_name = "clientes"

export class Cliente{
    static particular = 0;
    static inscripto  = 1;

    constructor(request){
        if ('id' in request)
            this.id = request.id;

        this.nombre = request.nombre;
        this.email  = request.email;
        this.tipo   = request.tipo;

        if (request.tipo == Cliente.inscripto){
            this.cuit = request.cuit;
        }
    }

    static async validate(request) {
        if(!('tipo' in request))
            throw new ValidationError("Se debe pasar un tipo");
        if(!Cliente.tipos[request.tipo])
            throw new ValidationError("El tipo del cliente no es correcto [0,1]");

        if (request.tipo == Cliente.inscripto)
            await Cliente.validate_inscripto(request);

        if (!request.nombre)
            throw new ValidationError("El nombre es obligatorio");

        if (!('email' in request))
            this.email = ""
    }
    
    static async validate_inscripto(request){
        if (!('cuit' in request))
            throw new ValidationError("El cuit es obligatorio para los clientes inscriptos");

       if (await Cliente.cuil_exists(request.cuit))
            throw new Duplicated(`Ya existe un cliente con cuil ${request.cuit}`)

        const cliente = await afip.RegisterScopeFive.getTaxpayerDetails(request.cuit);
        console.log("cliente:", cliente);
        if (cliente === null)
            throw new NotFound(`La persona con CUIT ${request.cuit} no está cargada en afip`);
    }

    async get_afip_data(){
        let afip_data = await afip.RegisterScopeFive.getTaxpayerDetails(this.cuit);
        //console.log("afip_data: ", JSON.stringify(afip_data, null, 4));

        if (!afip_data.datosGenerales.domicilioFiscal.localidad)
            afip_data.datosGenerales.domicilioFiscal.localidad = 'CAPITAL FEDERAL'

        let impuestos = null;
        if (afip_data.datosRegimenGeneral)
            impuestos = afip_data.datosRegimenGeneral.impuesto
        else if(afip_data.datosMonotributo)
            impuestos = afip_data.datosMonotributo.impuesto

        var iva = impuestos.find(i => i.idImpuesto == 32);
        if (iva)
            this.cond_fiscal = iva.descripcionImpuesto;

        if (afip_data.datosGenerales.tipoPersona == 'JURIDICA')
            this.razon_social = afip_data.datosGenerales.razonSocial;
        else 
            this.razon_social = afip_data.datosGenerales.nombre+' '+afip_data.datosGenerales.apellido;

        this.domicilio = ''
            + afip_data.datosGenerales.domicilioFiscal.direccion+' - '
            + afip_data.datosGenerales.domicilioFiscal.localidad+ ' ' 
            + afip_data.datosGenerales.domicilioFiscal.descripcionProvincia;
    }

    async consumidor_final(){
        this.cond_fiscal  = "CONSUMIDOR FINAL"
        this.razon_social = "CONSUMIDOR FINAL"
        this.domicilio = ""
        this.cuit = "0"
    }

    static async cuil_exists(cuit){
        let res = (await conn.query(`

            SELECT COUNT(id) as count FROM ${table_name}
            WHERE cuit=${cuit}
            AND tipo=${Cliente.inscripto}`
            
        ))[0][0].count;
        return res > 0;
    }

    async insert() {
        let res = (await conn.query(`
            INSERT INTO ${table_name} SET ?`
        , this))[0];

        this.id = res.insertId;
    }

    async update(data) {
        //Si cambiamos de tipo particular a inscripto
        if (data.tipo != this.tipo && data.tipo == Cliente.inscripto){
            await Cliente.validate_inscripto(data);
            if (data.cuit && await Cliente.cuil_exists(data.cuit))
                throw new Duplicated(`Ya existe un cliente con cuil ${data.cuit}`)
        } 
        if (this.tipo == Cliente.inscripto){
            if (data.cuit && await Cliente.cuil_exists(data.cuit))
                throw new Duplicated(`Ya existe un cliente con cuil ${data.cuit}`)
        }

        this.tipo   = data.tipo     || this.tipo;
        this.cuit   = data.cuit     || this.cuit;
        this.nombre = data.nombre   || this.nombre;
        this.email  = data.email    || this.email;

        let res = (await conn.query(`
            UPDATE ${table_name} SET ?
            WHERE id=${this.id}`
        , this))[0];

        if (res.affectedRows == 0)
            throw new NotFound(`No se encuentra el cliente con id ${this.id}`);

        if (res.changedRows == 0)
            throw new NothingChanged('Ningun valor es distinto a lo que ya existia en la base de datos');
    }

    static async delete(id){
        let res = (await conn.query(`
            DELETE FROM ${table_name}
            WHERE id=${id}`
        ))[0];

        if (res.affectedRows == 0)
            throw new NotFound(`No se encuentra el cliente con id ${id}`);
    }

    async get_stock(){
        let res = (await conn.query(`

            SELECT 
                titulo, libros.isbn, sc.stock
            FROM stock_cliente as sc
            INNER JOIN libros
                ON libros.isbn = sc.isbn
            WHERE id_cliente=${this.id}

        `))[0];
        return res;
    }

    async update_stock(libros){
        console.log("libros: ", libros);
        let stock_clientes = libros.map(l => [this.id, l.cantidad, l.isbn])
        await conn.query(`

            INSERT INTO stock_cliente
                (id_cliente, stock, isbn)
                VALUES ?
            ON DUPLICATE KEY UPDATE
                stock = stock + VALUES(stock)

        `, [stock_clientes]);

        /*
        INSERT INTO stock_cliente (id_cliente, stock, isbn)
        VALUES 
            (78, 1, 97898712345), 
            (78, 4, 98765432187)
        ON DUPLICATE KEY UPDATE
            stock = 
                CASE
                    WHEN stock > VALUES(stock) THEN stock - VALUES(stock)
                    ELSE stock
                END;
        */
    }
    /*
        INSERT INTO stock_cliente
        (id_cliente, stock, isbn)
        VALUES (78, -3, 98765432100), (78, -1, 97898712345)
        ON DUPLICATE KEY UPDATE
            stock = stock + VALUES(stock)     
    */

    async have_stock(libros){
        for (let libro of libros){
            let count = (await conn.query(`

                SELECT COUNT(*) as count FROM stock_cliente
                WHERE id_cliente=${this.id}
                AND isbn = ${libro.isbn}
                AND stock < ${libro.cantidad};

            `))[0][0].count;

            if (count > 0){
                throw new NotFound(`No hay suficiente stock del libro ${libro.isbn} para el cliente ${this.nombre} (${this.id})`);
            }
        }
    }

    static async get_all() {
        let clientes = (await conn.query(`
            SELECT * FROM ${table_name}
        `))[0];
            
        return clientes;
    }

    static async get_by_id(id) {
        let response = (await conn.query(`
            SELECT * FROM ${table_name} 
            WHERE id=${id}
        `))[0];

        if (!response.length)
            throw new NotFound(`El cliente con id ${id} no se encontro`);

        return new Cliente(response[0]);
    }
}

Cliente.tipos = [
    "particular",
    "inscripto"
]

Cliente.ValidationError = ValidationError;
Cliente.NotFound = NotFound;
Cliente.NothingChanged = NothingChanged;

