import * as express from 'express';

import * as PaisController from '../controller/pais';

export const Routes = express.Router();


Routes.get('/paises/:id', PaisController.getPaisById);
Routes.get('/paises', PaisController.getPaises);

