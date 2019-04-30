import * as express from 'express';

import * as DepartamentoController from '../controller/departamento';

export const Routes = express.Router();


Routes.get('/departamentos/:id', DepartamentoController.getDepartamentoById);

Routes.get('/departamentos', DepartamentoController.getDepartamento);
Routes.post('/departamentos', DepartamentoController.addDepartamento);

