import express from "express"

import dotenv from 'dotenv'

import personaRouter from "./routes/persona.routes.js"
import libroRouter from "./routes/libro.routes.js"
import ClienteRouter from "./routes/cliente.routes.js"
import VentaRouter from "./routes/venta.routes.js"

dotenv.config();
export const app = express()
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({extended: true,}));

app.use('/persona', personaRouter);

app.use('/libro', libroRouter);

app.use('/cliente', ClienteRouter);

app.use('/venta', VentaRouter);

//Cualquier otra ruta no especificada
app.use('*', (req, res) => res.status(404).json({
    success: false,
    error: "Esta ruta no hace nada negro"
}));

app.listen(port, () => console.log(`Libros Silvestres start in port ${port}!`))

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: err
    });
  });
