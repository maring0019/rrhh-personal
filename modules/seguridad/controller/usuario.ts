import BaseController from "../../../core/app/basecontroller";
import { Usuario } from "../../../auth/schemas/Usuarios";

class UsuarioController extends BaseController {
	constructor(model) {
		super(model);
		this.add = this.add.bind(this);
	}

	async add(req, res, next) {
		try {
			let obj = req.body;
			obj = this.cleanObjectID(obj);
			let object = new Usuario(obj);
			const objNuevo = await object.save();
			return res.json(objNuevo);
		} catch (err) {
			return next(err);
		}
	}
}

export default UsuarioController;
