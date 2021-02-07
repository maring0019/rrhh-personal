import * as express from 'express';
import { Adjunto } from '../schemas/adjunto';
import AdjuntoController from '../controller/adjunto';
import { authenticate } from '../,,/../../../auth/middleware';

const controller = new AdjuntoController(Adjunto); 
const baseUrl = '/adjuntos';

export const Routes = express.Router();

Routes.get(`${baseUrl}`, controller.get);
Routes.get(`${baseUrl}/:id`, controller.getById);

Routes.post(`${baseUrl}`, authenticate(), controller.add);
Routes.put(`${baseUrl}/:id`, authenticate(), controller.update);
Routes.delete(`${baseUrl}/:id`, controller.delete);
