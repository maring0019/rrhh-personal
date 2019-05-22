import * as express from 'express';

import * as TipoSituacionController from '../controller/tiposituacion';

export const Routes = express.Router();


Routes.get('/tiposituaciones', TipoSituacionController.getTipoSituaciones)
Routes.post('/tiposituaciones', TipoSituacionController.addTipoSituacion);

Routes.put('/tiposituaciones/:id', TipoSituacionController.updateTipoSituacion)
Routes.delete('/tiposituaciones/:id', TipoSituacionController.deleteTipoSituacion);