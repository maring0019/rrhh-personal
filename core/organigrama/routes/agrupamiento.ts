import * as express from 'express';

import * as AgrupamientoController from '../controller/agrupamiento';

export const Routes = express.Router();


Routes.get('/agrupamientos/:id', AgrupamientoController.getAgrupamientoById);

Routes.get('/agrupamientos', AgrupamientoController.getAgrupamientos);
Routes.post('/agrupamientos', AgrupamientoController.addAgrupamiento);

