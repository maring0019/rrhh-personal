import * as express from 'express';

import * as TipoNormaLegalController from '../controller/normalegal';

export const Routes = express.Router();


Routes.get('/tiposnormalegal/:id', TipoNormaLegalController.getTipoNormaLegalById);

Routes.get('/tiposnormalegal', TipoNormaLegalController.getTipoNormaLegal);
Routes.post('/tiposnormalegal', TipoNormaLegalController.addTipoNormaLegal);

