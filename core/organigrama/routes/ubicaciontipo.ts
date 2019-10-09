import * as express from 'express';
import { UbicacionTipo } from '../schemas/ubicaciontipo';
import UbicacionTipoController from '../controller/ubicaciontipo';

const controller = new UbicacionTipoController(UbicacionTipo); 
const baseUrl = '/ubicacionestipo';

export const Routes = express.Router();

Routes.get(`${baseUrl}`, controller.get);
Routes.get(`${baseUrl}/:id`, controller.getById);

Routes.post(`${baseUrl}`, controller.add);
Routes.put(`${baseUrl}/:id`, controller.update);
Routes.delete(`${baseUrl}/:id`, controller.delete);
