import * as express from 'express';
import { Pais } from '../schemas/pais';
import PaisController from '../controller/pais';

const controller = new PaisController(Pais); 

export const Routes = express.Router();

Routes.get('/paises', controller.get);
Routes.get('/paises/:id', controller.getById);

Routes.post('/paises', controller.add);
Routes.put('/paises/:id', controller.update);
Routes.delete('/paises/:id', controller.delete);
