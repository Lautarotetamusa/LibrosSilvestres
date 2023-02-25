import { Cliente } from "../models/cliente.model.js";
import {parse_error} from '../models/errors.js';

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
            success: true,
            message: "Cliente creado correctamente",
            data: cliente
        });
    } catch (error) { //Error handling
        return parse_error(res, error); 
    }
}

ClienteController.update = async (req, res) => {
    try {
        if (Object.keys(req.body).length === 0 && req.body.constructor === Object) //Si pasamos un objeto vacio
            return res.status(204).json({
                success: false,
                message: "No hay ningun campo para actualizar",
            })

        let cliente = await Cliente.get_by_id(req.params.id);
        
        await cliente.update(req.body);
        
        return res.status(201).json({
            success: true,
            message: "Cliente actualizado correctamente",
            data: cliente
        })
    } catch (error) {
        return parse_error(res, error);
    }
}

ClienteController.get_stock = async(req, res) => {
    try {
        const cliente = await Cliente.get_by_id(req.params.id);
        
        let stock = await cliente.get_stock();
        return res.json(stock)
    } catch (error) {
        return parse_error(res, error);
    }
}

ClienteController.delet = async (req, res) => {
    try {
        await Cliente.delete(req.params.id)

        return res.json({
            success: true,
            message: `Cliente con id ${req.params.id} eliminado correctamente`
        })

    } catch (error) {
        return parse_error(res, error); 
    }
}

ClienteController.get_all = async function(req, res){
    try {
        let clientes = await Cliente.get_all()
        
        res.json(clientes)
    } catch (error) {
        return parse_error(res, error);
    }
}

ClienteController.get_one = async function(req, res){
    let params = req.params;

    if (!params.id) return res.status(400).json({
        success: false,
        message: "Se nececita pasar un id"
    });

    try {
        let cliente = await Cliente.get_by_id(params.id);

        res.json(cliente);
    } catch (error) {
        return parse_error(res, error); 
    }
}


