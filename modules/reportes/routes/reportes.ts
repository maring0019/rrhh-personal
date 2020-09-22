import * as express from 'express';
import ReportesController from '../controller/reportes';

const controller = new ReportesController(); 

export const Routes = express.Router();

Routes.get('/agentes/legajo', controller.getLegajoAgente);
Routes.get('/agentes/legajo/download', controller.downloadLegajoAgente);

Routes.get('/agentes/listado', controller.getListadoAgente);
Routes.get('/agentes/listado/download', controller.downloadListadoAgente);

Routes.get('/agentes/ausentismo/totalesporarticulo', controller.getTotalesPorArticulo);
Routes.get('/agentes/ausentismo/totalesporarticulo/download', controller.downloadTotalesPorArticulo);

Routes.get('/agentes/ausentismo', controller.getAusenciasPorAgente);
Routes.get('/agentes/ausentismo/download', controller.downloadAusenciasPorAgente);

Routes.get('/agentes/licencias', controller.getLicenciasPorAgente);
Routes.get('/agentes/licencias/download', controller.downloadLicenciasPorAgente);

Routes.get('/agentes/partes', controller.getPartes);
Routes.get('/agentes/partes/download', controller.downloadPartes);

Routes.get('/agentes/credencial', controller.getCredencial);
Routes.get('/agentes/credencial/download', controller.downloadCredencial);


Routes.get('/ausentismo/certificado', controller.getCertificado);
Routes.get('/ausentismo/certificado/download', controller.downloadCertificado);

Routes.get('/opcionesAgrupamiento', controller.opcionesAgrupamiento);
Routes.get('/opcionesOrdenamiento', controller.opcionesOrdenamiento);
