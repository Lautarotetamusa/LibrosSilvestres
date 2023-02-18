import express from "express"

import {LibroController} from "../controllers/libro.controller.js"

const router = express.Router();

// Create new libro
router.post('/', LibroController.create);

// Get libro by id
router.get('/:isbn', LibroController.get_one);

// Get libros (paginated)
router.get('', LibroController.get_all);

router.put('/:isbn', LibroController.update);

//Actualizar las personas del libro
router.post('/:isbn/personas', LibroController.update_personas);
router.put('/:isbn/personas', LibroController.update_personas);
router.delete('/:isbn/personas', LibroController.update_personas);

router.delete('/:isbn', LibroController.delete);


export default router;