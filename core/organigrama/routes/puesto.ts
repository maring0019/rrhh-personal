import * as express from 'express';
import { Puesto } from '../schemas/puesto';
import PuestoController from '../controller/puesto';

const controller = new PuestoController(Puesto); 

export const Routes = express.Router();

Routes.get('/puestos', controller.get);
Routes.get('/puestos/:id', controller.getById);

Routes.post('/puestos', controller.add);
Routes.put('/puestos/:id', controller.update);
Routes.delete('/puestos/:id', controller.delete);
