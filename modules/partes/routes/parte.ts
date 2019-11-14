import * as express from 'express';
import { Parte } from '../schemas/parte';
import ParteController from '../controller/parte';

const controller = new ParteController(Parte); 
const baseUrl = '/partes';

export const Routes = express.Router();

Routes.get(`${baseUrl}`, controller.get);
Routes.get(`${baseUrl}/agentes/reportes`, controller.getPartesAgenteReporte);
Routes.get(`${baseUrl}/:id/partesagentes`, controller.getPartesAgentes);
Routes.get(`${baseUrl}/:id`, controller.getById);

Routes.post(`${baseUrl}`, controller.add);
Routes.post(`${baseUrl}/:id/procesar`, controller.procesar);
Routes.post(`${baseUrl}/:id/guardar`, controller.guardar);
Routes.post(`${baseUrl}/:id/confirmar`, controller.confirmar);
Routes.post(`${baseUrl}/:id/editar`, controller.editar);
Routes.put(`${baseUrl}/:id`, controller.update);
Routes.delete(`${baseUrl}/:id`, controller.delete);
