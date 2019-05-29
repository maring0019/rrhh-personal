import * as express from 'express';

import * as LocalidadController from '../controller/localidad';

export const Routes = express.Router();


Routes.get('/localidad/:id', LocalidadController.getLocalidadById);
Routes.get('/localidades', LocalidadController.getLocalidades);

Routes.post('/localidades', LocalidadController.addLocalidad);
