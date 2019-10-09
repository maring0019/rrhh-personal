import * as express from 'express';
import { UbicacionSubtipo } from '../schemas/ubicacionsubtipo';
import UbicacionSubtipoController from '../controller/ubicacionsubtipo';

const controller = new UbicacionSubtipoController(UbicacionSubtipo); 
const baseUrl = '/ubicacionessubtipo';

export const Routes = express.Router();

Routes.get(`${baseUrl}`, controller.get);
Routes.get(`${baseUrl}/:id`, controller.getById);

Routes.post(`${baseUrl}`, controller.add);
Routes.put(`${baseUrl}/:id`, controller.update);
Routes.delete(`${baseUrl}/:id`, controller.delete);
