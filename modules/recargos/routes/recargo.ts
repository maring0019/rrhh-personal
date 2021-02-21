import * as express from 'express';
import { Recargo } from '../schemas/recargo';
import RecargoController from '../controller/recargo';

const controller = new RecargoController(Recargo); 
const baseUrl = '/recargos';

export const Routes = express.Router();

Routes.get(`${baseUrl}`, controller.get);
Routes.get(`${baseUrl}/:id`, controller.getById);

Routes.post(`${baseUrl}`, controller.add);
Routes.put(`${baseUrl}/:id`, controller.update);
Routes.delete(`${baseUrl}/:id`, controller.delete);
