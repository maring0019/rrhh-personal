import * as express from 'express';
import { RecargoJustificacion } from '../schemas/recargojustificacion';
import RecargoJustificacionController from '../controller/recargojustificacion';

const controller = new RecargoJustificacionController(RecargoJustificacion); 
const baseUrl = '/recargojustificaciones';

export const Routes = express.Router();

Routes.get(`${baseUrl}`, controller.get);
Routes.get(`${baseUrl}/:id`, controller.getById);

Routes.post(`${baseUrl}`, controller.add);
Routes.put(`${baseUrl}/:id`, controller.update);
Routes.delete(`${baseUrl}/:id`, controller.delete);