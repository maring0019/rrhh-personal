import * as express from 'express';
import * as AusenciaController from '../controller/ausencia';

import * as AusentismoAddController from '../controller/ausentismo';


export const Routes = express.Router();


// Routes.get('/ausencias', AusenciaController.getAusencias);
// Routes.get('/ausencias/:id', AusenciaController.getAusenciaById);


Routes.post('/ausencias', AusenciaController.addAusencia);
Routes.post('/ausencias/periodo', AusentismoAddController.addAusentismo);
Routes.post('/ausencias/periodo/sugerir', AusentismoAddController.sugerirDiasAusencia);
Routes.post('/ausencias/periodo/calcular', AusenciaController.calcularAusentismo);

Routes.get('/ausencias/periodo', AusenciaController.getAusenciasPeriodo);
Routes.get('/ausencias/periodo/:id', AusenciaController.getAusentismoById);
Routes.put('/ausencias/periodo/:id', AusenciaController.updateAusentismo);
// Routes.delete('/ausencias/:id', AusenciaController.deleteAusencia);

Routes.post('/licencias/periodo', AusentismoAddController.addLicencia);

