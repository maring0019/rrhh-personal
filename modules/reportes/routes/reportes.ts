import * as express from 'express';
import * as ReportesController from '../controller/reportes';


export const Routes = express.Router();


Routes.get('/legajo', ReportesController.getLegajoAgente);
Routes.get('/legajo/download', ReportesController.downloadLegajoAgente);