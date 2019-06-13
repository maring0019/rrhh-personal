import * as express from 'express';
import AgenteController from '../controller/agente';


export const Routes = express.Router();


Routes.get('/agentes', AgenteController.getAgentes);
Routes.get('/agentes/search', AgenteController.searchAgentes);
Routes.get('/agentes/:id', AgenteController.getAgenteByID);
Routes.get('/agentes/:id/fotos', AgenteController.getFotoPerfil);
Routes.get('/agentes/:id/ausencias', AgenteController.getAusencias);


Routes.post('/agentes', AgenteController.addAgente);
Routes.post('/agentes/:id/fotos', AgenteController.uploadFotoPerfil);

Routes.put('/agentes/:id', AgenteController.updateAgente);
Routes.delete('/agentes/:id', AgenteController.deleteAgente);

