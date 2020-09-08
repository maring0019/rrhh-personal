import BaseController from "../../app/basecontroller";
import { Ubicacion } from "../schemas/ubicacion";

class UbicacionController extends BaseController {
	constructor(model) {
		super(model);
		this.getUbicacionesHospital = this.getUbicacionesHospital.bind(this);
		this.getUbicacionesFromPadre = this.getUbicacionesFromPadre.bind(this);
		this.getByCodigo = this.getByCodigo.bind(this);
	}

	async getByCodigo(req, res, next) {
		try {
			let obj = await Ubicacion.findOne({ codigo: req.params.codigo });
			return res.json(obj);
		} catch (err) {
			return next(err);
		}
	}

	async getUbicacionesHospital(req, res, next) {
		try {
			// Recuperar supuestamente de la funcion dbo.hsp_Ubicaciones_HospitalInterno()
			const codigoHospital = 2;
			const ubicacionHospital: any = await Ubicacion.findOne({
				codigo: codigoHospital,
			});
			let objs = await this.getUbicacionesChildrenFromPadre(
				ubicacionHospital.codigo
			);
			objs.unshift(ubicacionHospital); // Colocamos primero la ubicacion hospital
			return res.json(objs);
		} catch (err) {
			return next(err);
		}
	}

	async getUbicacionesFromPadre(req, res, next) {
		try {
			// Recuperamos la ubicacion padre y luego los hijos
			let ubicacionPadre: any = await Ubicacion.findOne({
				codigo: req.params.codigo,
			});
			if (!ubicacionPadre)
				return res
					.status(404)
					.send({ message: this.getMessageNotFound() });

			let objs = await this.getUbicacionesChildrenFromPadre(
				ubicacionPadre.codigo
			);
			objs.unshift(ubicacionPadre); // Colocamos primero la ubicacion padre
			return res.json(objs);
		} catch (err) {
			return next(err);
		}
	}

	async getUbicacionesChildrenFromPadre(codigoPadre) {
		return await Ubicacion.aggregate([
			{ $match: { ancestors: codigoPadre } },
			{
				$lookup: {
					from: "sectores",
					localField: "codigo",
					foreignField: "ubicacion",
					as: "sectores",
				},
			},
			{
				$match: { sectores: { $ne: [] } },
			},
		]);
	}
}

export default UbicacionController;
