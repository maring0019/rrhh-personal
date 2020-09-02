import * as express from "express";
import { Rol } from "../schemas/rol";
import RolController from "../controller/rol";

const controller = new RolController(Rol);

export const Routes = express.Router();

Routes.get("/roles", controller.get);
Routes.get("/roles/:id", controller.getById);

Routes.post("/roles", controller.add);
Routes.put("/roles/:id", controller.update);
Routes.delete("/roles/:id", controller.delete);
