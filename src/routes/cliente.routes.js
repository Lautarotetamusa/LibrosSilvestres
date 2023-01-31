import express from "express"

import {ClienteController} from "../controllers/cliente.controller.js"

const router = express.Router();

router.post('/', ClienteController.create);

router.get('/', ClienteController.get_all);

router.get('/:id', ClienteController.get_one);

router.put('/:id', ClienteController.update)

router.delete('/:id', ClienteController.delet)

export default router;