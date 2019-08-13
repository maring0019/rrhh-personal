import * as express from 'express';
import * as DescargasController from '../controller/descargas';


export const Routes = express.Router();


Routes.get('/ausentismo/:id/comprobantes/certificado/download', DescargasController.downloadCertificado);
Routes.get('/ausentismo/:id/comprobantes/certificado', DescargasController.getCertificado);
