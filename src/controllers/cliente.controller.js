import { Cliente } from "../models/cliente.model.js";

export const ClienteController = {};

/*
    Request example
    {
        tipo: "inscripto",
        nombre: "Raul",
        cuit: 2043491979,
        email: "",
        cond_fiscal: 0,
    }

    {
        tipos: "particular",
        nombre: "Jose",
        email: "jose@gmail.com"
    }
*/

ClienteController.create = async (req, res) => {
     try {
        Cliente.validate(req.body);

        const cliente = new Cliente(req.body);

        await cliente.insert();

        res.status(201).json({
            message: "Cliente creado correctamente",
            data: cliente
        });
    } catch (error) { //Error handling
        if (error instanceof Cliente.ValidationError)
            return res.status(error.status_code).json({message: error.message})

        console.log(error)
        return res.status(500).json(error);   
    }
}

ClienteController.update = async (req, res) => {
    try {
        if (Object.keys(req.body).length === 0 && req.body.constructor === Object) //Si pasamos un objeto vacio
            return res.status(204).json({
                message: "No hay ningun campo para actualizar",
            })

        let cliente = await Cliente.get_by_id(req.params.id);
        
        cliente = await cliente.update(req.body);
        
        return res.status(201).json({
            message: "Cliente actualizado correctamente",
            data: cliente
        })
    } catch (error) {
        if (error instanceof Cliente.NotFound)
            return res.status(error.status_code).json({message: error.message})
        if (error instanceof Cliente.NothingChanged)
            return res.status(error.status_code).json({message: error.message})
        if (error instanceof Cliente.ValidationError)
            return res.status(error.status_code).json({message: error.message})
        
        console.log(error)
        return res.status(500).json(error); 
    }
}

ClienteController.delet = async (req, res) => {
    try {
        await Cliente.delete(req.params.id)

        return res.json({message: `Cliente con id ${req.params.id} eliminado correctamente`})

    } catch (error) {
        console.log(error)
        if (error instanceof Cliente.NotFound)
            return res.status(error.status_code).json({message: error.message})

        return res.status(500).json(error); 
    }
}

ClienteController.get_all = async function(req, res){
    try {
        let clientes = await Cliente.get_all()
        
        res.json(clientes)
    } catch (error) {
        return res.status(500).json(error)
    }
}

ClienteController.get_one = async function(req, res){
    let params = req.params;

    if (!params.id) return res.status(400).json({
        message: "Se nececita pasar un id"
    });

    try {
        let cliente = await Cliente.get_by_id(params.id);

        res.json(cliente);
    } catch (error) {
        if (error instanceof Cliente.NotFound)
            return res.status(error.status_code).json({message: error.message})

        console.log(error);
        return res.status(500).json(error); 
    }
}


