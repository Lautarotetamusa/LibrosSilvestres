import { Venta } from "../models/venta.model.js";
import { Cliente } from "../models/cliente.model.js";
import { Libro } from "../models/libro.model.js";
import { parse_error } from "../models/errors.js"

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
    let libros = [];
    
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
            libros[i] = await Libro.get_by_isbn(body.libros[i].isbn);

            body.libros[i].precio = libros[i].precio;

            if (libros[i].stock < body.libros[i].cantidad)
                return res.status(400).json({
                    success: false,
                    error: `El libro ${libros[i].titulo} con isbn ${libros[i].isbn} no tiene suficiente stock`
                })
        }
        console.log("libros", libros);
        //Actualizar el stock de todos los libros
        for (let i in body.libros){
            console.log("new stock",  {stock: libros[i].stock - body.libros[i].cantidad});
            await libros[i].update({
                stock: libros[i].stock - body.libros[i].cantidad
            });
        }

        //body.libros = libros;
        console.log("body libros", body.libros);

        const venta = new Venta(body);

        await venta.insert();

        res.status(201).json(venta)

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
    }
}

VentaController.ventas_libro = async(req, res) => {
    try {
        let ventas = await Venta.get_by_isbn(req.params.isbn);
        return res.json(ventas);
    } catch (error) {
        return parse_error(res, error);
    }
}