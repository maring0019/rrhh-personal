import * as express from 'express';
import { Guardia } from '../schemas/guardia';
import GuardiaController from '../controller/guardia';

const controller = new GuardiaController(Guardia); 
const baseUrl = '/guardias';

export const Routes = express.Router();

Routes.get(`${baseUrl}`, controller.get);
Routes.get(`${baseUrl}/:id`, controller.getById);
Routes.get(`${baseUrl}/:id/generar-csv`, controller.generarCSV);

Routes.post(`${baseUrl}`, controller.add);
Routes.post(`${baseUrl}/confirmar`, controller.addAndConfirmar);

Routes.put(`${baseUrl}/:id`, controller.update);
Routes.put(`${baseUrl}/:id/confirmar`, controller.updateAndConfirmar);
Routes.put(`${baseUrl}/:id/procesar`, controller.updateAndProcesar);

Routes.delete(`${baseUrl}/:id`, controller.delete);
