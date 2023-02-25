import { Consignacion } from "../models/consignacion.model.js";
import { Cliente } from "../models/cliente.model.js";
import { Libro } from "../models/libro.model.js";
import { parse_error } from "../models/errors.js"
export const ConsignacionController = {};

ConsignacionController.consignar = async(req, res) => {
    let body = req.body;
    let libros = [];

    try {
        Consignacion.validate(req.body);

        //Validar que el cliente exista o crearlo
        if (typeof body.cliente == Object){
            Cliente.validate(body.cliente);

            body.cliente = new Cliente(body.cliente);
            await body.cliente.insert();
        }
        else{
            body.cliente = await Cliente.get_by_id(body.cliente);
        }
  
        //Validar que los libros existan y tengan suficiente stock
        for (let i in body.libros) {
            libros[i] = await Libro.get_by_isbn(body.libros[i].isbn);

            if (libros[i].stock < body.libros[i].cantidad)
                return res.status(400).json({
                    success: false,
                    error: `El libro ${libros[i].titulo} con isbn ${libros[i].isbn} no tiene suficiente stock`
                })
        }

        //Actualizar el stock de todos los libros
        for (let i in body.libros){
            await libros[i].update_stock(-body.libros[i].cantidad);
        }

        const consignacion = new Consignacion(body);
        await consignacion.insert();
        consignacion.libros = libros;

        res.status(201).json(consignacion);

    } catch (error) {
        return parse_error(res, error);
    }
}