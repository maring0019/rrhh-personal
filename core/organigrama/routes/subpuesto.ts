import * as express from 'express';

import * as SubPuestoController from '../controller/subpuesto';

export const Routes = express.Router();


Routes.get('/subpuestos/:id', SubPuestoController.getSubPuestoById);

Routes.get('/subpuestos', SubPuestoController.getSubPuesto);
Routes.post('/subpuestos', SubPuestoController.addSubPuesto);

