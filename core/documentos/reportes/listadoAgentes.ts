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
		let query = aqp(this.request.query, {
			casters: {
				documentoId: (val) => Types.ObjectId(val),
			},
			castParams: {
				_id: "documentoId",
				"situacionLaboral.cargo.sector._id": "documentoId",
			},
		});

		// Por defecto estos campos siempre se van a mostrar en el reporte
		const defaultProjection = {
			numero: 1,
			documento: 1,
			nombre: 1,
			apellido: 1,
			"situacionLaboral.cargo.sector.nombre": 1,
			"situacionLaboral.cargo.ubicacion.nombre": 1,
		};
		// Identificamos el campo por el cual agrupar. Si no se especifico agregamos
		// uno por defecto
		let groupField = utils.getQueryParam(query.filter, "$group");
		if (!groupField) groupField = "situacionLaboral.cargo.sector.nombre";
		const groupCondition = {
			_id: `$${groupField}`,
			agentes: { $push: "$$ROOT" },
		};
		// Recordar que no se puede especificar un agrupamiento

		// Preparamos las opciones de filtrado
		let filterCondition = this.deleteGroupFromFilter(query.filter);
		// Recordar que el filtro por activo es activo=true o activo!=true

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

	deleteGroupFromFilter(filter) {
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
