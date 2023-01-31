import express from "express"

import personaRouter from "./routes/persona.routes.js"
import libroRouter from "./routes/libro.routes.js"
import ClienteRouter from "./routes/cliente.routes.js"
import VentaRouter from "./routes/venta.routes.js"

export const app = express()
const port = 3000 

app.use(express.json());
app.use(express.urlencoded({extended: true,}));

app.use('/persona', personaRouter);

app.use('/libro', libroRouter);

app.use('/cliente', ClienteRouter);

app.use('/venta', VentaRouter);

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
