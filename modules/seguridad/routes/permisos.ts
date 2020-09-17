import * as express from "express";
import * as permisos from "../../../auth/permisos";

export const Routes = express.Router();

Routes.get("/permisos", (req, res) => {
	res.json(permisos.default);
});
