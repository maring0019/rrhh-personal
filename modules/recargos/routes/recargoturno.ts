import * as express from 'express';
import { RecargoTurno } from '../schemas/recargoturno';
import RecargoTurnoController from '../controller/recargoturno';

const controller = new RecargoTurnoController(RecargoTurno); 
const baseUrl = '/recargoturnos';

export const Routes = express.Router();

Routes.get(`${baseUrl}`, controller.get);
Routes.get(`${baseUrl}/:id`, controller.getById);

Routes.post(`${baseUrl}`, controller.add);
Routes.put(`${baseUrl}/:id`, controller.update);
Routes.delete(`${baseUrl}/:id`, controller.delete);
