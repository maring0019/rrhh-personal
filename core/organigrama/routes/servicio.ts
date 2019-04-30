import * as express from 'express';

import * as ServicioController from '../controller/servicio';

export const Routes = express.Router();


Routes.get('/servicios/:id', ServicioController.getServicioById);

Routes.get('/servicios', ServicioController.getServicio);
Routes.post('/servicios', ServicioController.addServicio);

