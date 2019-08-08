import * as express from 'express';
import * as FrancoController from '../controller/franco';

export const Routes = express.Router();

Routes.post('/francos', FrancoController.addFranco);
