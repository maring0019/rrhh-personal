import * as express from 'express';
import IndicadorLicenciaController from '../controller/indicadorlicencia';
import { IndicadorLicencia } from '../schemas/indicadorlicencia';

export const Routes = express.Router();

const controller = new IndicadorLicenciaController(IndicadorLicencia); 

Routes.get('/indicadores-licencias/:id', controller.getById);
Routes.get('/indicadores-licencias', controller.get);
Routes.get('/indicadores-licencias/agentes/:id', controller.getIndicadoresLicenciaAgente);
Routes.get('/indicadores-licencias/agentes/:id/totales', controller.getIndicadoresLicenciaTotalesAgente);

Routes.post('/indicadores-licencias', controller.add);
Routes.put('/indicadores-licencias/:id', controller.update);

Routes.delete('/indicadores-licencias/:id', controller.delete);
