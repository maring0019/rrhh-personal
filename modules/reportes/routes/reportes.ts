import * as express from 'express';
import ReportesController from '../controller/reportes';

const controller = new ReportesController(); 

export const Routes = express.Router();

const middlewareView = async function (req, res, next) {
    try {
        res.locals.tipoReporte = req.query.tipoReporte;
        res.locals.formato = req.query.formato? req.query.formato : 'html';
        delete req.query.tipoReporte;
        delete req.query.formato;
        next();
    } catch (err) {
        return next(err);
    }
}

const middlewarePrint = async function (req, res, next) {
    try {
        res.locals.tipoReporte = req.query.tipoReporte;
        res.locals.formato = req.query.formato? req.query.formato : 'pdf';
        delete req.query.tipoReporte;
        delete req.query.formato;
        next();
    } catch (err) {
        return next(err);
    }
}

Routes.get('/view', middlewareView, controller.getReporte);
Routes.get('/print', middlewarePrint, controller.getReporte);


Routes.get('/agentes/partes', controller.getPartes);
Routes.get('/agentes/partes/download', controller.downloadPartes);

Routes.get('/agentes/credencial', controller.getCredencial);
Routes.get('/agentes/credencial/download', controller.downloadCredencial);


Routes.get('/ausentismo/certificado', controller.getCertificado);
Routes.get('/ausentismo/certificado/download', controller.downloadCertificado);

Routes.get('/opciones-tipo-reporte', controller.opcionesTipoReporte);
Routes.get('/opciones-agrupamiento', controller.opcionesAgrupamiento);
Routes.get('/opciones-ordenamiento', controller.opcionesOrdenamiento);
Routes.get('/opciones-visualizacion', controller.opcionesVisualizacion);
