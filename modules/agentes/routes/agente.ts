import * as express from "express";
import { AgenteController as Controller } from "../controller/agente";

export const Routes = express.Router();

Routes.get("/agentes", Controller.getAgentes);
Routes.get("/agentes/search", Controller.searchAgentes);
Routes.get("/agentes/:id", Controller.getAgenteByID);
Routes.get("/agentes/:id/fotos", Controller.getFotoPerfil);
Routes.get("/agentes/:id/ausencias", Controller.getAusencias);
Routes.get("/agentes/:id/ausencias/eventos", Controller.getAusenciasAsEvento);
Routes.get("/agentes/:id/licencias/totales", Controller.getLicenciasTotales);
Routes.get("/agentes/:id/ausencias/periodo", Controller.getAusencias);
Routes.get("/agentes/:id/notas", Controller.getNotas);
Routes.get("/agentes/:id/fichado/consultar", Controller.consultaFichadoAgente);

Routes.post("/agentes", Controller.addAgente);
Routes.post("/agentes/:id/fotos", Controller.uploadFotoPerfil);
Routes.post("/agentes/:id/files", Controller.uploadFilesAgente);

Routes.put("/agentes/:id", Controller.updateAgente);
Routes.put("/agentes/:id/baja", Controller.bajaAgente);
Routes.put("/agentes/:id/reactivar", Controller.reactivarAgente);
Routes.put("/agentes/:id/fichado/habilitar", Controller.habilitaFichadoAgente);
// prettier-ignore
Routes.put("/agentes/:id/fichado/inhabilitar", Controller.inhabilitaFichadoAgente);
Routes.put("/agentes/:id/historia/add", Controller.addHistoriaLaboral);
Routes.put("/agentes/:id/historia/update", Controller.updateHistoriaLaboral);
Routes.put("/agentes/:id/historia/delete", Controller.deleteHistoriaLaboral);
Routes.delete("/agentes/:id", Controller.deleteAgente);
