import express from "express"

import {PersonaController} from "../controllers/persona.controller.js"

const router = express.Router();

router.post('/', PersonaController.create);

router.get('/:tipo', PersonaController.get_all);

router.get('/:tipo/:id', PersonaController.get_one);

router.put('/:id', PersonaController.update)

router.delete('/:id', PersonaController.delete)

export default router;