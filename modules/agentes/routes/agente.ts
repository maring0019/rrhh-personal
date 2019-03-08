import * as express from 'express';
import AgenteController from '../controller/agente';


export const Routes = express.Router();


Routes.get('/agentes', AgenteController.getAgentes);
Routes.post('/agentes', AgenteController.addAgente);

Routes.put('/agentes/:id', AgenteController.updateAgente);
Routes.delete('/agentes/:id', AgenteController.deleteAgente);

