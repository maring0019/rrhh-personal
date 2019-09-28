import * as express from 'express';

import { TipoSituacion } from '../schemas/tiposituacion';
import TipoSituacionController from '../controller/causabaja';

const controller = new TipoSituacionController(TipoSituacion); 

export const Routes = express.Router();


Routes.get('/tiposituaciones', controller.get);
Routes.get('/tiposituaciones/:id', controller.getById);

Routes.post('/tiposituaciones', controller.add);
Routes.put('/tiposituaciones/:id', controller.update)
Routes.delete('/tiposituaciones/:id', controller.delete);
