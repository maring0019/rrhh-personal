import * as express from 'express';
import DescargasController from '../controller/descargas';

const controller = new DescargasController(); 

export const Routes = express.Router();


Routes.get('/ausentismo/:id/comprobantes/certificado/download', controller.downloadCertificado);
Routes.get('/ausentismo/:id/comprobantes/certificado', controller.getCertificado);

Routes.get('/agentes/:id/credencial', controller.getCredencial);
Routes.get('/agentes/:id/credencial/download', controller.downloadCredencial);
