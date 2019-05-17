import * as express from 'express';

import * as RegimenHorarioController from '../controller/regimenhorario';

export const Routes = express.Router();


Routes.get('/regimenhorarios', RegimenHorarioController.getRegimenHorario)
Routes.post('/regimenhorarios', RegimenHorarioController.addRegimenHorario);

Routes.put('/regimenhorarios/:id', RegimenHorarioController.updateRegimenHorario)
Routes.delete('/regimenhorarios/:id', RegimenHorarioController.deleteRegimenHorario);