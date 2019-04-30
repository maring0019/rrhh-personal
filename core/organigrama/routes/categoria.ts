import * as express from 'express';

import * as CategoriaController from '../controller/categoria';

export const Routes = express.Router();


Routes.get('/categorias/:id', CategoriaController.getCategoriaById);

Routes.get('/categorias', CategoriaController.getCategoria);
Routes.post('/categorias', CategoriaController.addCategoria);

