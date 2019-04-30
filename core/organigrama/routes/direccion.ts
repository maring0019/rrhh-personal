import * as express from 'express';

import * as DireccionController from '../controller/direccion';

export const Routes = express.Router();


Routes.get('/direcciones/:id', DireccionController.getDireccionById);

Routes.get('/direcciones', DireccionController.getDireccion);
Routes.post('/direcciones', DireccionController.addDireccion);

