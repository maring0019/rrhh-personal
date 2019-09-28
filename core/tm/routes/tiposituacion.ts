// import * as express from 'express';

// import * as TipoSituacionController from '../controller/tiposituacion';

// export const Routes = express.Router();


// Routes.get('/tiposituaciones', TipoSituacionController.getTipoSituaciones)
// Routes.post('/tiposituaciones', TipoSituacionController.addTipoSituacion);

// Routes.put('/tiposituaciones/:id', TipoSituacionController.updateTipoSituacion)
// Routes.delete('/tiposituaciones/:id', TipoSituacionController.deleteTipoSituacion);

import * as express from 'express';

import { TipoSituacion } from '../schemas/tiposituacion';
import TipoSituacionController from '../controller/causabaja';

const controller = new TipoSituacionController(TipoSituacion); 

export const Routes = express.Router();


Routes.get('/tiposituaciones', controller.get);
Routes.post('/tiposituaciones', controller.add);

Routes.put('/tiposituaciones/:id', controller.update)
Routes.delete('/tiposituaciones/:id', controller.delete);
