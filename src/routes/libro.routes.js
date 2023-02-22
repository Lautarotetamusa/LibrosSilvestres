import express from "express"

import {LibroController} from "../controllers/libro.controller.js"
import {VentaController} from "../controllers/venta.controller.js"

const router = express.Router();

// Create new libro
router.post('/', LibroController.create);

// Get libro by id
router.get('/:isbn', LibroController.get_one);

// Get libros (paginated)
router.get('', LibroController.get_all);

router.put('/:isbn', LibroController.update);

//Actualizar las personas del libro
router.post('/:isbn/personas', LibroController.manage_personas);
router.put('/:isbn/personas', LibroController.manage_personas);
router.delete('/:isbn/personas', LibroController.manage_personas);

//Ventas de este libro
router.get('/:isbn/ventas', VentaController.ventas_libro)

router.delete('/:isbn', LibroController.delete);


export default router;