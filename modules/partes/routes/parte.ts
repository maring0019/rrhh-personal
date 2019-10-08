import * as express from 'express';
import { Parte } from '../schemas/parte';
import ParteController from '../controller/parte';


const controller = new ParteController(Parte); 

export const Routes = express.Router();

Routes.get('/partes', controller.get);
Routes.get('/partes/:id', controller.getById);

Routes.post('/partes', controller.add);
Routes.put('/partes/:id', controller.update);
Routes.delete('/partes/:id', controller.delete);
