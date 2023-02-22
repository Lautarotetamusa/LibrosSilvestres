import express from "express"

import {VentaController} from "../controllers/venta.controller.js"

const router = express.Router();

router.post('/', VentaController.vender);

router.get('/', VentaController.get_all);

router.get('/:id', VentaController.get_one);

export default router;