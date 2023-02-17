import {conn} from "../db.js"

import { Persona } from "../models/persona.model.js";
import { Libro } from "../models/libro.model.js";
import { parse_error } from "../models/errors.js"

function parse_req(body){
    //Persona.tipos agregando 'es' al final: [autores, ilustradores]
    let tipos_keys = Object.keys(Persona.tipos).map(k => k+"es");

    tipos_keys.forEach(tipo => {
        //Validamos que "autores" o "ilustradores" exista, si no existe le asignamos una lista vacia
        if (!body[tipo]) body[tipo] = []
        
        //Validamos que "autores" o "ilustradores" sea de tipo [], si es de tipo {} creamos una lista con un solo elemento: [{obj}]
        if (!Array.isArray(body[tipo])) body[tipo] = [body[tipo]]
        
        //Asignamos el tipo dependiendo de en que lista está, si está en "autores" o en "ilustradores"
        body[tipo].map(a => {
            a.tipo = tipos_keys.indexOf(tipo)
        });
    });
    //Concatenamos las dos listas y las devolvemos
    let personas = body.autores.concat(body.ilustradores);

    //Separamos los objetos que hay que crear(not_in_db) de los objetos que ya se encuentran en la DB(in_db)
    return {
        indb:     personas.filter(p => "id" in p),    //Lista de las personas que todavia no estan en la DB
        not_indb: personas.filter(p => !("id" in p))  //Lista de ids de las personas que ya están en la DB
    }
}

export const LibroController = {};

LibroController.create = async (req, res) => {

    try {
        let personas_data = [];  //Lista de personas validas y cargadas
        
        Libro.validate(req.body);                      //Validar la request

        await Libro.is_duplicated(req.body.isbn);

        const {indb, not_indb} = parse_req(req.body);  //Parsear la request

        //Validar los datos de las personas que no estan en la DB
        for (let i in not_indb){
            Persona.validate(not_indb[i]);    
        }

        //Validar que los ids existan en la DB
        for (let i in indb){
            let persona = await Persona.get_by_id(indb[i].id);
            persona.tipo = indb[i].tipo;
            personas_data.push(persona); //Cargar la data de las personas con esas IDs
            console.log("indb tipo:", personas_data.tipo);
        }
        
        //Insertar cada persona en la base de datos
        for (let i in not_indb){
            let persona = new Persona(not_indb[i])
            await persona.insert();

            indb.push({id: persona.id, tipo: not_indb[i].tipo}); //Agregar las personas cargadas a la lista de lo que ya esta en db
        }

        //Unir la lista de personas insertadas con las que ya existian
        personas_data = personas_data.concat(not_indb);
        console.log("personas_data:", personas_data);

        //Crear el libro
        const libro = new Libro(req.body);

        console.log("INDB", indb);
        await libro.insert(indb);

        return res.status(201).json({
            success: true,
            message: "Libro creado correctamente",
            data: {
                ...libro,
                autores:      personas_data.filter(p => p.tipo == Persona.tipos["autor"]),
                ilustradores: personas_data.filter(p => p.tipo == Persona.tipos["ilustrador"]),
            }
        })

    } catch (error) {
        return parse_error(res, error);
    }
}

LibroController.delete = async(req, res) => {
    try {
        await Libro.delete(req.params.isbn)

        return res.json({
            success: true,
            message: `Libro con isbn ${req.params.isbn} eliminado correctamente`
        })
    } catch (error) {
        return parse_error(res, error); 
    }
}

LibroController.update = async(req, res) => {
    try {
        let libro = await Libro.update(req.params.isbn, req.body);

        return res.json({message: `Libro con isbn ${req.params.isbn} actualizado correctamente`})
    } catch (error) {
        return parse_error(res, error);
    }
}

LibroController.get_one = async(req, res) => {
    try {
        let libro = await Libro.get_by_isbn(req.params.isbn)

        let personas = await Libro.get_personas(req.params.isbn)

        libro.autores = personas.autores;
        libro.ilustradores = personas.ilustradores;

        res.json(libro)
    } catch (error) {
        return parse_error(res, error);
    }
}

LibroController.get_all = async(req, res) => {

    let page = req.query.page || 0;

    try {
        let libros = await Libro.get_all(page);

        res.json(libros);
    } catch (error) {
        return parse_error(res, error);
    }
}