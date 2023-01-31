import {conn} from "../db.js"
import {Persona} from "./persona.model.js"

const table_name = "libros"

class LibroError extends Error {
    constructor(message, code){
        super(message);
        this.name = "LibroError";
        this.status_code = code;
    }
}

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
            throw new LibroError("El titulo es obligatorio", 400)

        if (!request.isbn)
            throw new LibroError("El isbn es obligatorio", 400)

        if (!request.fecha_edicion)
            throw new LibroError("La fecha de edicion es obligatoria", 400)

        if (!request.precio)
            throw new LibroError("El precio es obligatorio", 400)
    }


    async insert(personas) {
        //Agregamos el isbn y convertimos en lista para poder insertar todo junto
        console.log("personas:", personas)
        let persona_libro = personas.map(p => [this.isbn, p.id])
        console.log("personas_libro: ", persona_libro)

        //Insert Libro in table libros
        await conn.query("INSERT INTO libros SET ?", this)

        //Insertar los autores e ilustradores del libro en la tabla libros_personas
        if (personas.length > 0)
            await conn.query(`
                INSERT INTO libros_personas 
                (isbn, id_persona) VALUES ?`, 
                [persona_libro]
            ) 
    }
    
    static async update(isbn, data){
        
        let res = (await conn.query(`
            UPDATE ${table_name}
            SET ?
            WHERE isbn=${isbn}
        `, data))[0];

        if (res.affectedRows == 0)
            throw new LibroError(`No se encuentra el libro con isbn ${isbn}`, 404);

        //TODO: actualizar las personas
    }

    static async delete(isbn){
        await conn.query(`
            DELETE FROM libros_personas
            WHERE isbn=${isbn}
        `);

        let res = (await conn.query(`
            UPDATE FROM ${table_name}
            WHERE isbn=${isbn}`
        ))[0];

        if (res.affectedRows == 0)
            throw new LibroError(`No se encuentra el libro con isbn ${isbn}`, 404);   
    }

    static async get_by_isbn(isbn) {
        let response = (await conn.query(`
            SELECT * FROM ${table_name} 
            WHERE ${table_name}.isbn = ${isbn}
        `))[0];

        if (!response.length)
            throw new LibroError(`El libro con isbn ${isbn} no se encontro`, 404)

        return response[0];
    }

    static async get_personas(isbn) {
        let personas = (await conn.query(`
            SELECT personas.*
            FROM personas 
            INNER JOIN libros_personas
            INNER JOIN ${table_name}
            ON personas.id  = libros_personas.id_persona
            AND ${table_name}.isbn = libros_personas.isbn
            WHERE ${table_name}.isbn = ${isbn}
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

Libro.LibroError = LibroError; 