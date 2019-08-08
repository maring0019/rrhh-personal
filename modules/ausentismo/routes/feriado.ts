import * as express from 'express';
import * as FeriadoController from '../controller/feriado';

export const Routes = express.Router();

Routes.get('/feriados', FeriadoController.getFeriados);
Routes.get('/feriados/:id', FeriadoController.getFeriadoById);

Routes.post('/feriados', FeriadoController.addFeriado);
// Routes.put('/feriados/:id', FeriadoController.updateFeriado);
// Routes.delete('/feriados/:id', FeriadoController.deleteFeriado);