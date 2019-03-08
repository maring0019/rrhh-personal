import * as express from 'express';

import * as SituacionController from '../controller/situacion';

export const Routes = express.Router();


Routes.get('/situaciones', SituacionController.getSituaciones)
Routes.post('/situaciones', SituacionController.addSituacion);

Routes.put('/situaciones/:id', SituacionController.updateSituacion)
Routes.delete('/situaciones/:id', SituacionController.deleteSituacion);