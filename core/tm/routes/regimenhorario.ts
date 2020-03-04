import * as express from 'express';

import { RegimenHorario } from '../schemas/regimenhorario';
import RegimenHorarioController from '../controller/regimenhorario';

const controller = new RegimenHorarioController(RegimenHorario); 
const baseUrl = '/regimenhorarios';

export const Routes = express.Router();

Routes.get(`${baseUrl}`, controller.get);
Routes.get(`${baseUrl}/:id`, controller.getById);

Routes.post(`${baseUrl}`, controller.add);
Routes.put(`${baseUrl}/:id`, controller.update);
Routes.delete(`${baseUrl}/:id`, controller.delete);