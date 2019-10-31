import * as express from 'express';
import { ParteJustificacion } from '../schemas/partejustificacion';
import ParteJustificacionController from '../controller/partejustificacion';

const controller = new ParteJustificacionController(ParteJustificacion); 
const baseUrl = '/partejustificaciones';

export const Routes = express.Router();

Routes.get(`${baseUrl}`, controller.get);
Routes.get(`${baseUrl}/:id`, controller.getById);

Routes.post(`${baseUrl}`, controller.add);
Routes.put(`${baseUrl}/:id`, controller.update);
Routes.delete(`${baseUrl}/:id`, controller.delete);
