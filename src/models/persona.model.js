import {conn} from "../db.js"
import {ValidationError, NotFound, NothingChanged} from './errors.js'


const table_name = "personas";

//TODO: porcentaje de la persona
export class Persona {
    //Validamos al momento de crear un objeto
    constructor(persona) {
        this.nombre = persona.nombre;
        this.email  = persona.email;
        this.tipo   = persona.tipo;
    }
    
    static validate(request) {
        if (!request.nombre)
            throw new ValidationError("El nombre es obligatorio");

        if (!request.email)
            this.email = ""

        //if (![0, 1].includes(request.tipo))
            //throw new ValidationError("El tipo debe ser 0(autor) o 1(ilustrador)'");
    }

    async insert() {
        let exists = (await conn.query(`
            SELECT id from ${table_name}
            WHERE dni == ${this.dni}
        `))[0].length >= 0;

        if (exists)
            throw new Duplicated(`La persona con dni ${this.dni} ya se encuentra cargada`);

        let res = (await conn.query(`
            INSERT INTO ${table_name} SET ?`
        , this))[0];

        this.id = res.insertId;
    }

    async update(id) {
        let res = (await conn.query(`
            UPDATE ${table_name} SET ?
            WHERE id=${id}
            AND is_deleted = 0`
        , this))[0];

        if (res.affectedRows == 0)
            throw new NotFound(`No se encuentra la persona con id ${id}`);

        if (res.changedRows == 0)
            throw new NothingChanged('Ningun valor es distinto a lo que ya existia en la base de datos');

        return {
            id: res.insertedId,
            ...this
        };
    }

    static async delete(id){
        /*await conn.query(`
            DELETE FROM libros_personas
            WHERE id_persona = ${id}
        `);*/

        /*let res = (await conn.query(`
            DELETE FROM ${table_name}
            WHERE id=${id}`
        ))[0];*/

        let res = (await conn.query(`
            UPDATE ${table_name}
            SET is_deleted = 1
            WHERE id=${id}`
        ))[0];

        if (res.affectedRows == 0)
            throw new NotFound(`No se encuentra la persona con id ${id}`);
    }

    static async get_all(tipo) {
        let personas = (await conn.query(`
            SELECT id, nombre, email, tipo FROM ${table_name} 
            WHERE tipo=${tipo}
            AND is_deleted = 0
        `))[0];
            
        return personas;
    }

    static async get_by_id(id, tipo) {
        let response = (await conn.query(`
            SELECT id, nombre, email, tipo FROM ${table_name} 
            WHERE tipo=${tipo} 
            AND id=${id}
            AND is_deleted = 0
        `))[0];

        if (!response.length)
            throw new NotFound(`El ${Persona.str_tipos[tipo]} con id ${id} no se encontro`);

        return response[0];
    }

    static async get_libros(id){
        let libros = (await conn.query(`
            SELECT libros.* FROM libros
            INNER JOIN libros_personas
                ON libros_personas.id_persona=${id}
            INNER JOIN ${table_name}
                ON libros.isbn = libros_personas.isbn
            WHERE personas.id=${id}
            AND personas.is_deleted = 0
        `))[0];

        return libros;
    }
}

Persona.tipos = {
    autor: 0,
    ilustrador: 1
}
Persona.str_tipos = Object.keys(Persona.tipos);






