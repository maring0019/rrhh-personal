import * as express from "express";
import { Ubicacion } from "../schemas/ubicacion";
import UbicacionController from "../controller/ubicacion";

const controller = new UbicacionController(Ubicacion);
const baseUrl = "/ubicaciones";

export const Routes = express.Router();

Routes.get(`${baseUrl}`, controller.get);
Routes.get(`${baseUrl}/hospital`, controller.getUbicacionesHospital);
Routes.get(`${baseUrl}/:codigo/children`, controller.getUbicacionesFromPadre);
Routes.get(`${baseUrl}/codigo/:codigo`, controller.getByCodigo);
Routes.get(`${baseUrl}/:id`, controller.getById);

Routes.post(`${baseUrl}`, controller.add);
Routes.put(`${baseUrl}/:id`, controller.update);
Routes.delete(`${baseUrl}/:id`, controller.delete);
