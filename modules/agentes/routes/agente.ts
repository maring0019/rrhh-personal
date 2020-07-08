import * as express from 'express';
import AgenteController from '../controller/agente';


export const Routes = express.Router();


Routes.get('/agentes', AgenteController.getAgentes);
Routes.get('/agentes/search', AgenteController.searchAgentes);
Routes.get('/agentes/:id', AgenteController.getAgenteByID);
Routes.get('/agentes/:id/fotos', AgenteController.getFotoPerfil);
Routes.get('/agentes/:id/ausencias', AgenteController.getAusencias);
Routes.get('/agentes/:id/ausencias/eventos', AgenteController.getAusenciasAsEvento);
Routes.get('/agentes/:id/licencias/totales', AgenteController.getLicenciasTotales);
Routes.get('/agentes/:id/ausencias/periodo', AgenteController.getAusencias);
Routes.get('/agentes/:id/notas', AgenteController.getNotas);


Routes.post('/agentes', AgenteController.addAgente);
Routes.post('/agentes/:id/fotos', AgenteController.uploadFotoPerfil);
Routes.post('/agentes/:id/files', AgenteController.uploadFilesAgente);


Routes.put('/agentes/:id', AgenteController.updateAgente);
Routes.put('/agentes/:id/baja', AgenteController.bajaAgente);
Routes.put('/agentes/:id/reactivar', AgenteController.reactivarAgente);
Routes.put('/agentes/:id/historia/add', AgenteController.addHistoriaLaboral);
Routes.put('/agentes/:id/historia/update', AgenteController.updateHistoriaLaboral);
Routes.put('/agentes/:id/historia/delete', AgenteController.deleteHistoriaLaboral);
Routes.delete('/agentes/:id', AgenteController.deleteAgente);

