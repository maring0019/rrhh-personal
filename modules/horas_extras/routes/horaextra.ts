import * as express from 'express';
import { HoraExtra } from '../schemas/horaextra';
import HoraExtraController from '../controller/horaextra';

const controller = new HoraExtraController(HoraExtra); 
const baseUrl = '/horasextras';

export const Routes = express.Router();

Routes.get(`${baseUrl}`, controller.get);
Routes.get(`${baseUrl}/:id`, controller.getById);

Routes.post(`${baseUrl}`, controller.add);
Routes.post(`${baseUrl}/confirmar`, controller.addAndConfirmar);

Routes.put(`${baseUrl}/:id`, controller.update);
Routes.put(`${baseUrl}/:id/confirmar`, controller.updateAndConfirmar);
Routes.put(`${baseUrl}/:id/procesar`, controller.updateAndProcesar);
Routes.put(`${baseUrl}/:id/habilitar-edicion`, controller.updateAndHabilitarEdicion);

Routes.delete(`${baseUrl}/:id`, controller.delete);
