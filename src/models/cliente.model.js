import {conn} from '../db.js'
import {ValidationError, NotFound, NothingChanged, Duplicated} from './errors.js';

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
            this.cond_fiscal = request.cond_fiscal;
            this.cuit = request.cuit;
        }
    }

    static validate(request) {
        if (request.tipo == Cliente.inscripto)
            Cliente.validate_inscripto(request);

        if(!('tipo' in request))
            throw new ValidationError("Se debe pasar un tipo");

        if (!request.nombre)
            throw new ValidationError("El nombre es obligatorio");

        if (!('email' in request))
            this.email = ""

        if(!Cliente.tipos[request.tipo])
            throw new ValidationError("El tipo del cliente no es correcto [0,1]");
    }
    static validate_inscripto(request){
        if (!('cuit' in request))
            throw new ValidationError("El cuit es obligatorio para los clientes inscriptos");
            
        if(!('cond_fiscal' in request))
            throw new ValidationError("La condicion fiscal es obligatoria para los clientes inscriptos");

        if(!Cliente.cond_fiscales[request.cond_fiscal-1])
            throw new ValidationError("La condicion fiscal no es correcta [1..14]");
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
        if (this.tipo == Cliente.inscripto && await Cliente.cuil_exists(this.cuit))
            throw new Duplicated(`Ya existe un cliente con cuil ${this.cuit}`)

        let res = (await conn.query(`
            INSERT INTO ${table_name} SET ?`
        , this))[0];

        this.id = res.insertId;
    }

    async update(data) {
        //Si cambiamos de tipo particular a inscripto
        if (data.tipo != this.tipo && data.tipo == Cliente.inscripto){
            Cliente.validate_inscripto(data);
            if (data.cuit && await Cliente.cuil_exists(data.cuit))
                throw new Duplicated(`Ya existe un cliente con cuil ${data.cuit}`)
        } 
        if (this.tipo == Cliente.inscripto){
            if (data.cuit && await Cliente.cuil_exists(data.cuit))
                throw new Duplicated(`Ya existe un cliente con cuil ${data.cuit}`)
        }

        this.tipo = data.tipo || this.tipo;
        this.cuit = data.cuit || this.cuit;
        this.cond_fiscal = data.cond_fiscal || this.cond_fiscal;
        this.nombre = data.nombre || this.nombre;
        this.email = data.email || this.email;

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

//Los codigos arrancan en uno, asi que a esta tabla hay q restarle uno
Cliente.cond_fiscales = [
    "IVA Responsable Inscripto",	
    "IVA Responsable no Inscripto",
    "IVA no Responsable",	
    "IVA Sujeto Exento",
    "Consumidor Final",	
    "Responsable Monotributo",	
    "Sujeto no Categorizado",	
    "Proveedor del Exterior",	
    "Cliente del Exterior",	
    "IVA Liberado – Ley Nº 19.640",
    "IVA Responsable Inscripto – Agente de Percepción",	
    "Pequeño Contribuyente Eventual",	
    "Monotributista Social",	
    "Pequeño Contribuyente Eventual Social",	
]

Cliente.ValidationError = ValidationError;
Cliente.NotFound = NotFound;
Cliente.NothingChanged = NothingChanged;

