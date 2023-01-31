import { Persona } from "../models/persona.model.js";

export const PersonaController = {};

PersonaController.create = async (req, res) => {
     try {
        Persona.validate(req.body);

        const persona = new Persona(req.body);

        await persona.insert(req.body);

        res.status(201).json({
            message: "Persona creada correctamente",
            data: persona
        });
    } catch (error) { //Error handling
        if (error instanceof Persona.ValidationError)
            return res.status(error.status_code).json({message: error.message})
        
        return res.status(500).json(error);   
    }
}

PersonaController.update = async (req, res) => {
    try {
        const persona = new Persona(req.body);
    
        if (Object.keys(persona).length === 0 && persona.constructor === Object) //Si persona es un objeto vacio
            return res.status(204).json({
                message: "No hay ningun campo para actualizar",
            })

        await persona.update(req.params.id);

        return res.status(201).json({
            message: "Persona actualizada correctamente",
            data: persona
        })
    } catch (error) {
        console.log(error)
        if (error instanceof Persona.NotFound)
            return res.status(error.status_code).json({message: error.message})
        if (error instanceof Persona.NothingChanged)
            return res.status(error.status_code).json({message: error.message})

        return res.status(500).json(error); 
    }
}

PersonaController.delete = async (req, res) => {
    try {
        await Persona.delete(req.params.id)

        return res.json({message: `Persona con id ${req.params.id} eliminada correctamente`})

    } catch (error) {
        console.log(error)
        if (error instanceof Persona.NotFound)
            return res.status(error.status_code).json({message: error.message})

        return res.status(500).json(error); 
    }
}

PersonaController.get_all = async (req, res) => {
    let params = req.params;

    if (!params.tipo) return res.status(400).json({
        message: "Es necesesario pasar un tipo"
    }); 
    if(!(params.tipo in Persona.tipos)) return res.status(400).json({
        message: `El tipo pasado no es correcto (${Persona.str_tipos})`
    })
    
    try {
        let personas = await Persona.get_all(Persona.tipos[params.tipo])
        
        res.json(personas)
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
}

PersonaController.get_one = async (req, res) => {
    let params = req.params;

    if (!params.id) return res.status(400).json({
        message: "Se nececita pasar un id"
    });

    try {
        const persona  = await Persona.get_by_id(params.id, Persona.tipos[params.tipo]);
        
        persona.libros = await Persona.get_libros(params.id)

        res.json(persona);
    } catch (error) {
        if (error instanceof Persona.NotFound)
            return res.status(error.status_code).json({message: error.message}); 
        
        console.log(error);
        return res.status(500).json(error);
    }
}


