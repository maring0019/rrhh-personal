import * as express from 'express';
import { GuardiaPeriodo } from '../schemas/guardiaperiodo';
import GuardiaPeriodoController from '../controller/guardiaperiodo';

const controller = new GuardiaPeriodoController(GuardiaPeriodo); 
const baseUrl = '/guardiaperiodos';

export const Routes = express.Router();

Routes.get(`${baseUrl}`, controller.get);
Routes.get(`${baseUrl}/:id`, controller.getById);

Routes.post(`${baseUrl}`, controller.add);
Routes.put(`${baseUrl}/:id`, controller.update);
Routes.delete(`${baseUrl}/:id`, controller.delete);
