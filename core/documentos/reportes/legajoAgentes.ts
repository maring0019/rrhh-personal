import { Types } from "mongoose";
import * as aqp from "api-query-params";

import { DocumentoPDF } from "../documentos";
import { Agente } from "../../../modules/agentes/schemas/agente";

import config from "../../../confg";
import * as utils from "../utils";

export class DocumentoLegajoAgente extends DocumentoPDF {
	templateName = "reportes/agentes-legajo.ejs";
	outputFilename = `${config.app.uploadFilesPath}/legajo.pdf`;

	generarCSS() {
		return "";
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
			return { agentes: agentes };
		} catch {
			return { agentes: agentes };
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
			},
		});
	}
}
