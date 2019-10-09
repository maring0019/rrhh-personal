import * as express from 'express';
import { UbicacionServicio } from '../schemas/ubicacionservicio';
import UbicacionServicioController from '../controller/ubicacionservicio';

const controller = new UbicacionServicioController(UbicacionServicio); 
const baseUrl = '/ubicaciones';

export const Routes = express.Router();

Routes.get(`${baseUrl}`, controller.get);
Routes.get(`${baseUrl}/:id`, controller.getById);

Routes.post(`${baseUrl}`, controller.add);
Routes.put(`${baseUrl}/:id`, controller.update);
Routes.delete(`${baseUrl}/:id`, controller.delete);
