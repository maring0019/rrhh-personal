import * as express from 'express';
import { IndicadorAusentismo } from '../schemas/indicador';
import IndicadorController from '../controller/indicador';

export const Routes = express.Router();

const controller = new IndicadorController(IndicadorAusentismo); 

Routes.get('/indicadores', controller.get);
Routes.get('/indicadores/licencias', controller.getIndicadorLicencia);

Routes.post('/indicadores', controller.add);
Routes.post('/indicadores/licencias', controller.addIndicadorLicencia);