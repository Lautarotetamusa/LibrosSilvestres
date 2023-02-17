import {conn} from "../db.js"
import {Persona} from "./persona.model.js"
import {ValidationError, NotFound, Duplicated} from './errors.js'

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

        //TODO: actualizar las personas
    }

    static async add_personas(isbn, personas){
        //Agregamos el isbn y convertimos en lista para poder insertar todo junto
        let persona_libro = personas.map(p => [isbn, p.id, p.tipo])
        //TODO: Persona_libro = [...new Set(persona_libro)]; //Sacamos los duplicados
        console.log("personas_libro:", persona_libro);

        if (personas.length > 0)
            await conn.query(`
                INSERT INTO libros_personas 
                (isbn, id_persona, tipo) VALUES ?`, 
                [persona_libro]
            )
    }
    
    static async remove_personas(isbn, personas){
        //Agregamos el isbn y convertimos en lista para poder insertar todo junto
        let persona_libro = personas.map(p => [this.isbn, p.id])

        if (personas.length > 0)
            await conn.query(`
                DELETE FROM libros_personas
                WHERE isbn = ${isbn} 
                AND id_persona = ${personas[0].id}`
            )
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
            SELECT id, nombre, email, libros_personas.tipo
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