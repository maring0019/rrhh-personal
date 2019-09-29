import * as express from 'express';
import * as ReportesController from '../controller/reportes';


export const Routes = express.Router();


Routes.get('/agentes/legajo', ReportesController.getLegajoAgente);
Routes.get('/agentes/legajo/download', ReportesController.downloadLegajoAgente);

Routes.get('/agentes/listado', ReportesController.getListadoAgente);
Routes.get('/agentes/listado/download', ReportesController.downloadListadoAgente);

Routes.get('/agentes/ausentismo/totalesporarticulo', ReportesController.getTotalesPorArticulo);
Routes.get('/agentes/ausentismo/totalesporarticulo/download', ReportesController.downloadTotalesPorArticulo);

Routes.get('/agentes/ausentismo', ReportesController.getAusenciasPorAgente);
Routes.get('/agentes/ausentismo/download', ReportesController.downloadAusenciasPorAgente);

Routes.get('/agentes/licencias', ReportesController.getLicenciasPorAgente);
Routes.get('/agentes/licencias/download', ReportesController.downloadLicenciasPorAgente);