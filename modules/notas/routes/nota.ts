import * as express from 'express';
import { Nota } from '../schemas/nota';
import NotaController from '../controller/nota';
import { authenticate } from '../,,/../../../auth/middleware';

const controller = new NotaController(Nota); 
const baseUrl = '/notas';

export const Routes = express.Router();

Routes.get(`${baseUrl}`, controller.get);
Routes.get(`${baseUrl}/:id`, controller.getById);

Routes.post(`${baseUrl}`, authenticate(), controller.add);
Routes.put(`${baseUrl}/:id`, authenticate(), controller.update);
Routes.delete(`${baseUrl}/:id`, controller.delete);
