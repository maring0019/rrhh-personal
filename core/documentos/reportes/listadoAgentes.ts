import { Types } from "mongoose";
import * as aqp from "api-query-params";

import { DocumentoPDF } from "../documentos";
import { Agente } from "../../../modules/agentes/schemas/agente";

import * as utils from "../utils";
import { opcionesAgrupamiento, opcionesVisualizacion } from "../constants";
import config from "../../../confg";

// TODO Agregar al final de cada agrupamiento el total de agentes y el
// porcentaje que representa sobre el total de todos los agente

export class DocumentoListadoAgentes extends DocumentoPDF {
	templateName = "reportes/agentes-listado.ejs";
	outputFilename = `${config.app.uploadFilesPath}/listado.pdf`;

	getCSSFiles(){
        return this.isPrintable? ["css/reset.scss", "css/reports.scss", "css/print.scss"] : ["css/reports.scss"];
    }	

	async getContextData() {
		let query = this.getQueryOptions();

		// Por defecto estos campos siempre se van a mostrar en el reporte
		const defaultProjection = {
			numero: 1,
			documento: 1,
			nombre: 1,
			apellido: 1,
			"situacionLaboral.cargo.sector.nombre": 1,
			"situacionLaboral.cargo.ubicacion.nombre": 1,
		};
		// Extra project fields
		const projectCondition = this.cleanProjectConditions(query.projection);

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
					...(projectCondition || {}),
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

		return {
			agrupamientoLabel: agrupamientoOption.nombre,
			extraFieldsLabels: this.projectionToArray(projectCondition),
			results: gruposAgentes,
			srcImgLogo: this.headerLogo,
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

	/**
	 * Utilidad para determinar los campos a projectar en el pipeline.
	 * Basicamente toma el objeto que arma previamente la libreria aqp
	 * con los campos a proyectar y los 'reorganiza' asignandoles un
	 * nuevo nombre al campo proyectado (el cual se obtiene de las opciones
	 * de visualizacion).
	 * Ej. Si projection = {
	 *          { "estadoCivil": 1 },
	 *          { "nacionalidad.nombre": 1 }}
	 * retorna projection = {
	 *          { "Estado Civil": "$estadoCivil" },
	 *          { "Nacionalidad": "$nacionalidad.nombre" }}
	 *
	 * @param filter
	 */
	cleanProjectConditions(projection): any {
		if (projection) {
			Object.keys(projection).forEach((key) => {
				const option = opcionesVisualizacion.find((e) => e.id == key);
				if (option) {
					projection[option.nombre] = "$" + key;
					delete projection[key];
				}
			});
		}
		return projection;
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
