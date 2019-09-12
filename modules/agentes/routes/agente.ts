import * as express from 'express';
import AgenteController from '../controller/agente';


export const Routes = express.Router();


Routes.get('/agentes', AgenteController.getAgentes);
Routes.get('/agentes/search', AgenteController.searchAgentes);
Routes.get('/agentes/:id', AgenteController.getAgenteByID);
Routes.get('/agentes/:id/fotos', AgenteController.getFotoPerfil);
Routes.get('/agentes/:id/ausencias', AgenteController.getAusencias);
Routes.get('/agentes/:id/ausencias/periodo', AgenteController.getAusencias);


Routes.post('/agentes', AgenteController.addAgente);
Routes.post('/agentes/:id/fotos', AgenteController.uploadFotoPerfil);
Routes.post('/agentes/:id/files', AgenteController.uploadFilesAgente);
// 5cfea24202890c22fcad0e46

Routes.put('/agentes/:id', AgenteController.updateAgente);
Routes.put('/agentes/:id/baja', AgenteController.bajaAgente);
Routes.delete('/agentes/:id', AgenteController.deleteAgente);

