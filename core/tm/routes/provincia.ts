import * as express from 'express';

import * as ProvinciaController from '../controller/provincia';

export const Routes = express.Router();


Routes.get('/provincias/:id', ProvinciaController.getProvinciaById);
Routes.get('/provincias', ProvinciaController.getProvincias);

