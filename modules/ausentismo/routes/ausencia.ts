import * as express from 'express';
import * as AusenciaController from '../controller/ausencia';


export const Routes = express.Router();


// Routes.get('/ausencias', AusenciaController.getAusencias);
// Routes.get('/ausencias/:id', AusenciaController.getAusenciaById);


Routes.post('/ausencias', AusenciaController.addAusencia);
Routes.post('/ausencias/periodo', AusenciaController.addAusentismo);
Routes.post('/ausencias/periodo/sugerir', AusenciaController.sugerirAusentismo);
Routes.post('/ausencias/periodo/calcular', AusenciaController.calcularAusentismo);
Routes.get('/ausencias/periodo', AusenciaController.getAusenciasPeriodo);
Routes.get('/ausencias/periodo/:id', AusenciaController.getAusentismoById);
Routes.put('/ausencias/periodo/:id', AusenciaController.updateAusentismo);
// Routes.delete('/ausencias/:id', AusenciaController.deleteAusencia);

