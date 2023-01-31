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

router.delete('/:isbn', LibroController.delete);


export default router;