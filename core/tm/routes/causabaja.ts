import * as express from 'express';

import { CausaBaja } from '../schemas/causabaja';
import CausaBajaController from '../controller/causabaja';

const controller = new CausaBajaController(CausaBaja);

export const Routes = express.Router();

// Routes.get('/educacion/:id', EducacionController.getEducacionById);

Routes.get('/causabajas', controller.get);
Routes.post('/causabajas', controller.add);

