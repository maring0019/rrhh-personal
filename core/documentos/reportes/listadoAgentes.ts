import { Types } from "mongoose";
import * as aqp from "api-query-params";

import { DocumentoPDF } from "../documentos";
import { Agente } from "../../../modules/agentes/schemas/agente";

import * as utils from "../utils";
import { opcionesAgrupamiento } from "../constants";
import config from "../../../confg";

// TODO Agregar al final de cada agrupamiento el total de agentes y el
// porcentaje que representa sobre el total de todos los agente

export class DocumentoListadoAgentes extends DocumentoPDF {
	templateName = "reportes/agentes-listado.ejs";
	outputFilename = `${config.app.uploadFilesPath}/listado.pdf`;

	generarCSS() {
		return "";
	}

	async getContextData() {
		// Recuperamos todas las opciones para el reporte (filtros, orden, etc)
		let query = this.getQueryOptions();
		console.log(query);

		// Por defecto estos campos siempre se van a mostrar en el reporte
		const defaultProjection = {
			numero: 1,
			documento: 1,
			nombre: 1,
			apellido: 1,
			"situacionLaboral.cargo.sector.nombre": 1,
			"situacionLaboral.cargo.ubicacion.nombre": 1,
		};

		// Identificamos el campo por el cual agrupar.
		let groupField = utils.getQueryParam(query.filter, "$group");
		// Si no se especifico agregamos uno por defecto
		if (!groupField) groupField = "situacionLaboral.cargo.sector.nombre";
		const groupCondition = {
			_id: `$${groupField}`,
			agentes: { $push: "$$ROOT" },
		};
		const filterCondition = this.cleanFilterConditions(query.filter);
		// Aggregation Framework Pipeline
		let pipeline: any = [
			{ $match: filterCondition || {} },
			{ $sort: query.sort || { apellido: 1 } },
			{
				$project: {
					...(query.projection || {}),
					...defaultProjection,
					...{ [groupField]: 1 },
				},
			},
			{ $group: groupCondition },
			{ $sort: { _id: 1 } },
		];
		let gruposAgentes = await Agente.aggregate(pipeline);

		// Finalmente los datos para el template
		const agrupamientoOption = opcionesAgrupamiento.find(
			(elem) => elem.id == groupField
		);

		gruposAgentes = gruposAgentes.map((grupo) => {
			// Cast agentes into Agente type !Malisimo
			grupo.agentes = grupo.agentes.map((a) => new Agente(a));
			return grupo;
		});
		return {
			agrupamientoText: agrupamientoOption.nombre,
			agrupamientoAgente: gruposAgentes,
			extraFields: this.projectionToArray(query.projection),
		};
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

	/**
	 * Utilidad para eliminar condiciones que vienen en los
	 * query params y no se utilizan en los pipelines
	 * @param filter
	 */
	cleanFilterConditions(filter): any {
		// El atributo $group no se puede utilizar como filtro
		if (filter && filter.$group) {
			delete filter.$group;
		}
		return filter;
	}

	projectionToArray(extraFields) {
		let output = [];
		if (extraFields) {
			Object.keys(extraFields).forEach((field) => {
				output.push(field);
			});
		}
		return output;
	}
}
