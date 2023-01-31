import {conn} from '../db.js'

const table_name = "clientes"

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
            validate_inscripto();

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
        if (!request.cuit)
                throw new ValidationError("El cuit es obligatorio para los clientes inscriptos");
            
        if(!('cond_fiscal' in request))
            throw new ValidationError("La condicion fiscal es obligatoria para los clientes inscriptos");

        if(!Cliente.cond_fiscales[request.cond_fiscal-1])
            throw new ValidationError("La condicion fiscal no es correcta [1..14]");
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
            console.log(data.cond_fiscal);
            Cliente.validate_inscripto(data);
        } 

        let res = (await conn.query(`
            UPDATE ${table_name} SET ?
            WHERE id=${this.id}`
        , data))[0];

        if (res.affectedRows == 0)
            throw new NotFound(`No se encuentra el cliente con id ${this.id}`);

        if (res.changedRows == 0)
            throw new NothingChanged('Ningun valor es distinto a lo que ya existia en la base de datos');

        return new Cliente(data);
    }

    static async delete(id){
        let res = (await conn.query(`
            DELETE FROM ${table_name}
            WHERE id=${id}`
        ))[0];

        if (res.affectedRows == 0)
            throw new NotFound(`No se encuentra el cliente con id ${id}`);
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

