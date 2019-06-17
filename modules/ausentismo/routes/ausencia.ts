import * as express from 'express';
import * as AusenciaController from '../controller/ausencia';


export const Routes = express.Router();


Routes.get('/ausencias', AusenciaController.getAusencias);
Routes.get('/ausencias/:id', AusenciaController.getAusenciaById);

Routes.post('/ausencias', AusenciaController.addAusencia);
Routes.post('/ausencias/periodo', AusenciaController.addAusenciasPeriodo);
// Routes.put('/ausencias/:id', AusenciaController.updateAusencia);
// Routes.delete('/ausencias/:id', AusenciaController.deleteAusencia);

