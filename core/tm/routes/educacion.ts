import * as express from 'express';

import * as EducacionController from '../controller/educacion';

export const Routes = express.Router();


Routes.get('/educacion/:id', EducacionController.getEducacionById);

Routes.get('/educacion', EducacionController.getEducacion);
Routes.post('/educacion', EducacionController.addEducacion);

