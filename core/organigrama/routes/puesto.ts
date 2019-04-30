import * as express from 'express';

import * as PuestoController from '../controller/puesto';

export const Routes = express.Router();


Routes.get('/puestos/:id', PuestoController.getPuestoById);

Routes.get('/puestos', PuestoController.getPuesto);
Routes.post('/puestos', PuestoController.addPuesto);

