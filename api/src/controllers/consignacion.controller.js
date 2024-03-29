import { Consignacion } from "../models/consignacion.model.js";
import { Cliente } from "../models/cliente.model.js";
import { Libro } from "../models/libro.model.js";
import { Venta } from "../models/venta.model.js";
import { parse_error } from "../models/errors.js"

import { emitir_comprobante } from "../comprobantes/comprobante.js"
export const ConsignacionController = {};

ConsignacionController.consignar = async(req, res) => {
    let body = req.body;

    try {
        const consignacion = new Consignacion(body);

        await consignacion.set_client(body.cliente)
        
        await consignacion.set_libros(body.libros);

        await consignacion.cliente.update_stock(body.libros);

        await consignacion.insert();

        console.log("consignacion:", consignacion);

        await emitir_comprobante(consignacion, "remito");

        res.status(201).json({
            success: true,
            ...consignacion
        });

    } catch (error) {
        return parse_error(res, error);
    }
}

ConsignacionController.liquidar = async(req, res) => {
    let libros = [];
    let cliente;

    try {
        req.body.cliente = await Cliente.get_by_id(req.params.id);

        if(req.body.cliente.tipo == Cliente.particular){
            return res.status(400).json({
                success: false,
                error: "No se puede hacer una liquidacion a un cliente CONSUMIDOR FINAL"
            })
        }
  
        //Validar que los libros existan
        for (let i in req.body.libros) {
            libros[i] = await Libro.get_by_isbn(req.body.libros[i].isbn);

            await libros[i].update_stock(req.body.libros[i].cantidad);
        }

        await req.body.cliente.have_stock(req.body.libros);

        //Actualizar el stock del cliente
        let substacted_stock = req.body.libros.map(l => ({cantidad: -l.cantidad, isbn: l.isbn}));
        console.log(substacted_stock);
        await req.body.cliente.update_stock(substacted_stock);

        const venta = new Venta(req.body);

        res.status(201).json(venta);

    } catch (error) {
        return parse_error(res, error);
    }
}
