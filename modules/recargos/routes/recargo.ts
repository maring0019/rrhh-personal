import * as express from 'express';
import { Recargo } from '../schemas/recargo';
import RecargoController from '../controller/recargo';

const controller = new RecargoController(Recargo); 
const baseUrl = '/recargos';

export const Routes = express.Router();

Routes.get(`${baseUrl}`, controller.get);
Routes.get(`${baseUrl}/:id`, controller.getById);

Routes.post(`${baseUrl}`, controller.add);
Routes.post(`${baseUrl}/confirmar`, controller.addAndConfirmar);

Routes.put(`${baseUrl}/:id`, controller.update);
Routes.put(`${baseUrl}/:id/confirmar`, controller.updateAndConfirmar);
Routes.put(`${baseUrl}/:id/procesar`, controller.updateAndProcesar);

Routes.delete(`${baseUrl}/:id`, controller.delete);
