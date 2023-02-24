import { Venta } from "../models/venta.model.js";
import { Cliente } from "../models/cliente.model.js";
import { Libro } from "../models/libro.model.js";
import { parse_error } from "../models/errors.js"
import { create_factura } from "../facturacion/crearFacturas.js"

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
    let datos_venta = {
        "punto_venta": 4,
        "tipo_cbte": 11
    };
    
    
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
            body.libros[i].bonif  = body.porcentaje || 0.0;
            body.libros[i].titulo = libros[i].titulo;

            if (libros[i].stock < body.libros[i].cantidad)
                return res.status(400).json({
                    success: false,
                    error: `El libro ${libros[i].titulo} con isbn ${libros[i].isbn} no tiene suficiente stock`
                })
        }

        datos_venta.cliente = body.cliente.cuit;
        //datos_venta.cliente = 27249804024;
        datos_venta.tipo = Venta.str_medios_pago[body.medio_pago];

        console.log(datos_venta);
        console.log(libros);
        console.log(body.libros);
        
        //let {error} = await create_factura(body.libros, datos_venta);
        /*console.log("error: ", error);
        if (error) return res.status(404).json({
            success: true,
            error: error
        })*/

        await create_factura(body.libros, datos_venta);

        //Actualizar el stock de todos los libros
        for (let i in body.libros){
            console.log("new stock",  {stock: libros[i].stock - body.libros[i].cantidad});
            await libros[i].update({
                stock: libros[i].stock - body.libros[i].cantidad
            });
        }

        let date = new Date().toISOString()
            .replace(/\..+/, '')     // delete the . and everything after;
            .replace(/T/, '_')      // replace T with a space
            .replaceAll('-', '_')
            .replaceAll(':', '');

        body.path = 'facturas/'+date+'_'+body.cliente.cuit+'.pdf'; 

        const venta = new Venta(body);
        await venta.insert();

        res.status(201).json(venta);

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