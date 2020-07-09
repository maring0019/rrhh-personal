import * as express from 'express';
import { Nota } from '../schemas/nota';
import NotaController from '../controller/nota';
import { Auth } from '../,,/../../../auth';

const controller = new NotaController(Nota); 
const baseUrl = '/notas';

export const Routes = express.Router();

Routes.get(`${baseUrl}`, controller.get);
Routes.get(`${baseUrl}/:id`, controller.getById);

Routes.post(`${baseUrl}`, Auth.authenticate(), controller.add);
Routes.put(`${baseUrl}/:id`, Auth.authenticate(), controller.update);
Routes.delete(`${baseUrl}/:id`, controller.delete);
