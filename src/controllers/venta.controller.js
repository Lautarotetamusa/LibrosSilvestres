import { Venta } from "../models/venta.model.js";
<<<<<<< HEAD
import { Libro } from "../models/libro.model.js";
import { parse_error } from "../models/errors.js"
import { facturar } from "../afip/Afip.js";

export const VentaController = {};

VentaController.vender = async(req, res) => {
    let body = req.body;
    
    try {
        Venta.validate(body);
    
        const venta = new Venta(body);
    
        await venta.set_client(body.cliente);
       
        await venta.set_libros(body.libros);    
    
        console.log("venta:", venta);
        
        for (let i in venta.libros){
            await venta.libros[i].update_stock(-body.libros[i].cantidad);
        }
        
        await venta.insert();
    
        await facturar(venta);
    
        res.status(201).json({
            success: true,
            ...venta
        });

    } catch (error) {
        return parse_error(res, error);
    }
}

VentaController.get_one = async(req, res) => {
    try {
        let venta = await Venta.get_by_id(req.params.id);
        console.log(venta);
        return res.json(venta);
    } catch (error) {
        return parse_error(res, error);
    }
}

VentaController.get_all = async(req, res) => {
    try {
        let venta = await Venta.get_all(req.params.id);
        console.log(venta);
        return res.json(venta);
    } catch (error) {
        return parse_error(res, error);
=======
import { Cliente } from "../models/cliente.model.js";
import { Libro } from "../models/libro.model.js";

export const VentaController = {};

/*
    Request example
    {
        "medio_pago": 0,
        "descuento": 5.5,
        "cliente": 10,
        "libros": [
            {
                "isbn": 12345678910,
                "cantidad": 3
            },
            {
                "isbn": 12345678912,
                "cantidad": 1
            }   
        ]
    }

    {
        "medio_pago": 0,
        "descuento": 5.5,
        "cliente": {
            "tipo": 0,
            "nombre": "Raul",
            "cuit": 2043491979,
            "cond_fiscal": 3
        },
        "libros": [
            {
                "isbn": 12345678910,
                "cantidad": 3
            },
            {
                "isbn": 12345678912,
                "cantidad": 1
            }   
        ]
    }
*/

VentaController.vender = async(req, res) => {
    let body = req.body;
    let cliente;
    let libros;
    
    try {
        if (typeof body.cliente == Object){
            Cliente.validate(body.cliente);

            body.cliente = new Cliente(body.cliente);

            await cliente.insert();
        }
        else{
            body.cliente = await Cliente.get_by_id(body.cliente);
        }
        
        for (let i in body.libros) {
            let libro = await Libro.get_by_isbn(body.libros[i].isbn)

            if (libro.stock < body.libros[i].cantidad)
                return res.status(400).json({
                    message: `El libro ${libro.titulo} con isbn ${libro.isbn} no tiene suficiente stock`
                })

            body.libros[i] = {
                ...body.libros[i],
                ...libro
            };
        }

        const venta = new Venta(body);

        await venta.insert();

        res.status(201).json(venta)

    } catch (error) {
        if (error instanceof Cliente.NotFound)
            return res.status(error.status_code).json({message: error.message})
        if (error instanceof Libro.LibroError)
            return res.status(error.status_code).json({message: error.message})
        if (error instanceof Cliente.ValidationError)
            return res.status(error.status_code).json({message: error.message})
        if (error instanceof Venta.ValidationError)
            return res.status(error.status_code).json({message: error.message})
        
        console.log(error)
        return res.status(500).json(error);
>>>>>>> c4d6c31 (Ventas Libros y Personas)
    }
}