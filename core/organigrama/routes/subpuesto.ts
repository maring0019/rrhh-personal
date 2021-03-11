import * as express from 'express';
import { SubPuesto } from '../schemas/subpuesto';
import SubPuestoController from '../controller/subpuesto';

const controller = new SubPuestoController(SubPuesto); 

export const Routes = express.Router();

Routes.get('/subpuestos', controller.get);
Routes.get('/subpuestos/:id', controller.getById);

Routes.post('/subpuestos', controller.add);
Routes.put('/subpuestos/:id', controller.update);
Routes.delete('/subpuestos/:id', controller.delete);
