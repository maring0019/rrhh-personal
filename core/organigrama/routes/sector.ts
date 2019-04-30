import * as express from 'express';

import * as SectorController from '../controller/sector';

export const Routes = express.Router();


Routes.get('/sectores/:id', SectorController.getSectorById);

Routes.get('/sectores', SectorController.getSector);
Routes.post('/sectores', SectorController.addSector);

