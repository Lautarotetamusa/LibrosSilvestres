import {conn} from "../db.js"
import {Persona} from "./persona.model.js"
import {ValidationError, NotFound, Duplicated, NothingChanged} from './errors.js'

const table_name = "libros"

export class Libro {
    constructor(libro) {
        this.titulo = libro.titulo
        this.isbn   = libro.isbn
        this.fecha_edicion = libro.fecha_edicion
        this.precio = libro.precio
    }

    //Validate the request
    static validate(request) {
        if (!request.titulo)
            throw new ValidationError("El titulo es obligatorio")

        if (!request.isbn)
            throw new ValidationError("El isbn es obligatorio")

        if (!request.fecha_edicion)
            throw new ValidationError("La fecha de edicion es obligatoria")

        if (!('precio' in request))
            throw new ValidationError("El precio es obligatorio")
    }

    static async is_duplicated(isbn){
        let res =  (await conn.query(`
            SELECT COUNT(isbn) as count from ${table_name}
            WHERE ${table_name}.isbn = ${isbn}
            AND is_deleted = 0
        `))[0][0].count;

        console.log("RES", res);

        if (res > 0)
            throw new Duplicated(`El libro con isbn ${isbn} ya existe`);
    }

    async insert(personas) {
        //Insert Libro in table libros
        await conn.query("INSERT INTO libros SET ?", this);

        await Libro.add_personas(this.isbn, personas);
    }
    
    static async update(isbn, data){
        
        let res = (await conn.query(`
            UPDATE ${table_name}
            SET ?
            WHERE isbn=${isbn}
            AND is_deleted = 0
        `, data))[0];

        if (res.affectedRows == 0)
            throw new NotFound(`No se encuentra el libro con isbn ${isbn}`);
    }

    static async add_personas(isbn, personas){
        let persona_libro = personas.map(p => `('${isbn}', ${p.id}, ${p.tipo}, ${p.porcentaje || 0})`).join(', ');  //((isbn, id, tipo), (isbn, id, tipo) ...) String

        console.log("persona_lbro", persona_libro);

        //Validar si la persona ya trabaja en este libro
        let res = (await conn.query(`
            SELECT id_persona, tipo 
            FROM libros_personas 
            WHERE (isbn, id_persona, tipo, porcentaje) in (${persona_libro})`
        ))[0];

        for (let i in res) {
            throw new Duplicated(`La persona ${res[i].id_persona} ya es un ${Persona.str_tipos[res[i].tipo]} del libro ${isbn}`);
        }
        
        if (personas.length > 0)
            await conn.query(`
                INSERT INTO libros_personas 
                (isbn, id_persona, tipo, porcentaje) VALUES ${persona_libro}`
            )
    }

    static async update_personas(isbn, personas){

        for (let i in personas) {
            let res = (await conn.query(`
                UPDATE libros_personas 
                SET porcentaje = ${personas[i].porcentaje || 0}
                WHERE isbn=${isbn}
                AND id_persona=${personas[i].id}
                AND tipo=${personas[i].tipo}`
            ))[0];
        }
    }
    
    static async remove_personas(isbn, personas){
        let persona_libro = personas.map(p => `('${isbn}', ${p.id}, ${p.tipo})`).join(', ');  //((isbn, id, tipo), (isbn, id, tipo) ...) String

        if (personas.length > 0){
            let res = (await conn.query(`
                DELETE FROM libros_personas
                WHERE (isbn, id_persona, tipo) in (${persona_libro})`
            ))[0];

            if (res.affectedRows == 0)
                throw new NotFound(`Ninguna persona pasada trabaja en este libro con el tipo pasado`)
        }
    }

    static async delete(isbn){
        await conn.query(`
            DELETE FROM libros_personas
            WHERE isbn=${isbn}
        `);

        let res = (await conn.query(`
            UPDATE ${table_name}
            SET is_deleted = 1
            WHERE isbn=${isbn}
            AND is_deleted = 0`
        ))[0];

        if (res.affectedRows == 0)
            throw new NotFound(`No se encuentra el libro con isbn ${isbn}`);   
    }

    static async get_by_isbn(isbn) {
        let response = (await conn.query(`
            SELECT * FROM ${table_name} 
            WHERE ${table_name}.isbn = ${isbn}
            AND is_deleted = 0
        `))[0];

        if (!response.length)
            throw new NotFound(`El libro con isbn ${isbn} no se encontro`)

        return response[0];
    }

    static async get_personas(isbn) {
        let personas = (await conn.query(`
            SELECT id, nombre, email, libros_personas.tipo, libros_personas.porcentaje
            FROM personas 
            INNER JOIN libros_personas
            INNER JOIN ${table_name}
                ON personas.id  = libros_personas.id_persona
            AND ${table_name}.isbn = libros_personas.isbn
            WHERE ${table_name}.isbn = ${isbn}
            AND ${table_name}.is_deleted = 0
        `))[0];

        return {
            "autores":      personas.filter(p => p.tipo == Persona.tipos["autor"]),
            "ilustradores": personas.filter(p => p.tipo == Persona.tipos["ilustrador"])
        }
    }


    //TODO: Se hace una consulta a la DB por libro, no se si hay otra manera más rápida de hacerlo
    static async get_all(page = 0){
        let libros_per_page = 10;

        let libros = (await conn.query(`
            SELECT *
            FROM ${table_name}
            WHERE is_deleted = 0
            LIMIT ${libros_per_page}
            OFFSET ${page * libros_per_page}
        `))[0];

        for (let i in libros) {
            let {autores, ilustradores} = await this.get_personas(libros[i].isbn)

            libros[i].autores      = autores;
            libros[i].ilustradores = ilustradores;
        }

        return libros;
    }
}