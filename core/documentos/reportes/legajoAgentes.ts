import { Types } from "mongoose";
import * as aqp from "api-query-params";

import { DocumentoPDF } from "../documentos";
import { Agente } from "../../../modules/agentes/schemas/agente";

import config from "../../../confg";
import * as utils from "../utils";

export class DocumentoLegajoAgente extends DocumentoPDF {
	templateName = "reportes/agentes-legajo.ejs";
	outputFilename = `${config.app.uploadFilesPath}/legajo.pdf`;

	getCSSFiles(){
        return this.isPrintable? ["css/reset.scss", "css/reports.scss", "css/print.scss"] : ["css/reports.scss"];
    }	

	async getContextData() {
		let agentes = [];
		try {
			// Este reporte no tiene opciones de agrupamiento
			let query = this.getQueryOptions();

			// Search Pipeline
			let filters = utils.cleanFilters(query.filter);
			let pipeline: any = [
				{ $match: filters || {} },
				{ $sort: query.sort || { apellido: 1 } },
			];

			agentes = await Agente.aggregate(pipeline);
			return { agentes: agentes, srcImgLogo: this.headerLogo };
		} catch {
			return { agentes: agentes, srcImgLogo: this.headerLogo };
		}
	}

	/**
	 * Recupera todo los query parameters del request.
	 * Filtros, orden, campos a mostrar, etc
	 */
	getQueryOptions() {
		return aqp(this.request.query, {
			casters: {
				documentoId: (val) => Types.ObjectId(val),
			},
			castParams: {
				_id: "documentoId",
				"situacionLaboral.cargo.sector._id": "documentoId",
				"nacionalidad._id": "documentoId",
				"direccion.localidad._id": "documentoId",
				"direccion.localidad.provincia._id": "documentoId",
				"situacionLaboral.situacion.tipoSituacion._id": "documentoId",
				"situacionLaboral.normaLegal.tipoNormaLegal._id": "documentoId",
				"situacionLaboral.cargo.puesto._id": "documentoId",
				"situacionLaboral.cargo.subpuesto._id": "documentoId",
				"situacionLaboral.regimen.regimenHorario._id": "documentoId",
			},
		});
	}
}
