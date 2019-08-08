import * as express from 'express';
import * as IndicadorController from '../controller/indicador';

export const Routes = express.Router();

Routes.post('/indicadores', IndicadorController.addIndicador);