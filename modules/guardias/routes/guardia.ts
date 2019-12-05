import * as express from 'express';
import { Guardia } from '../schemas/guardia';
import GuardiaController from '../controller/guardia';

const controller = new GuardiaController(Guardia); 
const baseUrl = '/guardias';

export const Routes = express.Router();

Routes.get(`${baseUrl}`, controller.get);
Routes.get(`${baseUrl}/:id`, controller.getById);

Routes.post(`${baseUrl}`, controller.add);
Routes.put(`${baseUrl}/:id`, controller.update);
Routes.delete(`${baseUrl}/:id`, controller.delete);
