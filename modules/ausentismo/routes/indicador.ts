import * as express from 'express';
import { IndicadorAusentismo } from '../schemas/indicador';
import IndicadorController from '../controller/indicador';

export const Routes = express.Router();

const controller = new IndicadorController(IndicadorAusentismo); 

Routes.get('/indicadores', controller.get);
Routes.post('/indicadores', controller.add);

Routes.get('/indicadores/licencias', controller.getIndicadorLicencia);
Routes.get('/indicadores/licencias/:id', controller.getIndicadorLicenciaById);

Routes.post('/indicadores/licencias', controller.addIndicadorLicencia);
Routes.put('/indicadores/licencias/:id', controller.updateIndicadorLicencia);
Routes.delete('/indicadores/licencias/:id', controller.deleteIndicadorLicencia);
