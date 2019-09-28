import * as express from 'express';
import { Feriado } from '../schemas/feriado';
import FeriadoController from '../controller/feriado';

const controller = new FeriadoController(Feriado); 

export const Routes = express.Router();

Routes.get('/feriados', controller.get);
Routes.get('/feriados/:id', controller.getById);

Routes.post('/feriados', controller.add);
Routes.put('/feriados/:id', controller.update);
Routes.delete('/feriados/:id', controller.delete);