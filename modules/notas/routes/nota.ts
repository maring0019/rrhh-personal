import * as express from 'express';
import { Nota } from '../schemas/nota';
import NotaController from '../controller/nota';

const controller = new NotaController(Nota); 
const baseUrl = '/notas';

export const Routes = express.Router();

Routes.get(`${baseUrl}`, controller.get);
Routes.get(`${baseUrl}/:id`, controller.getById);

Routes.post(`${baseUrl}`, controller.add);
Routes.put(`${baseUrl}/:id`, controller.update);
Routes.delete(`${baseUrl}/:id`, controller.delete);
