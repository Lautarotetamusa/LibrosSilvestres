import express from "express"

import {ClienteController} from "../controllers/cliente.controller.js"
import {Cliente} from "../models/cliente.model.js"

const router = express.Router();

router.post('/', ClienteController.create);

router.get('/', ClienteController.get_all);

router.get('/:id', async (req, res) => {
    if (req.params.id == "cond_fiscales"){
        return res.json(Cliente.cond_fiscales);
    }
    ClienteController.get_one(req, res);
});

router.put('/:id', ClienteController.update)

router.delete('/:id', ClienteController.delet)

export default router;