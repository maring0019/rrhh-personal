import * as express from 'express';
import * as FrancoController from '../controller/franco';

export const Routes = express.Router();


Routes.get('/francos', FrancoController.getFrancos);
Routes.get('/francos/eventos', FrancoController.getAsEvento);

Routes.post('/francos', FrancoController.addFranco);
Routes.post('/francos/addMany', FrancoController.addManyFrancos);
Routes.post('/francos/deleteMany', FrancoController.deleteManyFrancos);

Routes.delete('/:id/francos', FrancoController.deleteFranco);

