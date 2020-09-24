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
		const filters = this.cleanFilterConditions(query.filter);
		// Aggregation Framework Pipeline
		let matchStage: any = this.getMatchStage(filters);
		let projectStage = [
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
		let pipeline = matchStage.concat(projectStage);
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

	esBusquedaAgenteActivos(filter): boolean {
		return filter && filter.activo === true;
	}

	esBusquedaAgentesInactivos(filter): boolean {
		return filter && filter.activo && filter.activo.$ne;
	}

	/**
	 * Reorganiza los filtros enviados como query params
	 * para buscar solo agentes inactivos
	 * @param filter
	 */
	getFiltersAgenteInactivos(filter) {
		let historiaFilters = {};
		if (filter["situacionLaboral.cargo.sector.ubicacion"]) {
			historiaFilters = {
				"changeset.cargo.sector.ubicacion":
					filter["situacionLaboral.cargo.sector.ubicacion"],
			};
		}
		let matchAgentesInactivos = {
			agenteFilters: { activo: { $ne: true } },
			historiaFilters: historiaFilters,
		};
		return matchAgentesInactivos;
	}

	/**
	 * Reorganiza los filtros enviados como query params
	 * para buscar tanto agentes activos como inactivos
	 * @param filter
	 */
	getFiltersAgentesTodos(filter) {
		let historiaFilters = {};
		if (filter["situacionLaboral.cargo.sector.ubicacion"]) {
			historiaFilters = {
				"changeset.cargo.sector.ubicacion":
					filter["situacionLaboral.cargo.sector.ubicacion"],
			};
		}
		let matchAgentes = {
			agenteActivoFilters: { ...filter },
			agenteInactivoFilters: { activo: { $ne: true } },
			historiaFilters: historiaFilters,
		};
		return matchAgentes;
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
	 * Prepara las condiciones 'matching/filtering' para el pipeline
	 * principal.
	 * Basicamente determina si aplicar los filtros sobre agentes
	 * activos o inactivos. Si hay que realizar busquedas sobre los
	 * agentes inactivos se complica un poco el pipeline ya que hay
	 * que buscar algunos datos sobre la historia laboral del agente
	 *
	 */
	getMatchStage(filter) {
		if (this.esBusquedaAgenteActivos(filter)) {
			return this.pipelineAgentesActivos(filter);
		}

		if (this.esBusquedaAgentesInactivos(filter)) {
			const filters = this.getFiltersAgenteInactivos(filter);
			return this.pipelineAgentesInactivos(
				filters.agenteFilters,
				filters.historiaFilters
			);
		}

		const filters = this.getFiltersAgentesTodos(filter);
		return this.pipelineAgentesTodos(
			filters.agenteActivoFilters,
			filters.agenteInactivoFilters,
			filters.historiaFilters
		);
	}

	pipelineAgentesActivos(agenteActivoFilters) {
		return [
			{
				$match: agenteActivoFilters,
			},
		];
	}

	pipelineAgentesInactivos(agenteInactivoFilters, historiaFilters) {
		return [
			{
				$match: {
					$and: [
						agenteInactivoFilters,
						{
							historiaLaboral: {
								$elemMatch: historiaFilters,
							},
						},
					],
				},
			},
			{ $unwind: "$historiaLaboral" },
			{
				$match: {
					"historiaLaboral.changeset.cargo.sector.ubicacion":
						historiaFilters["changeset.cargo.sector.ubicacion"],
				},
			},
			{
				$project: {
					numero: 1,
					documento: 1,
					nombre: 1,
					apellido: 1,
					"situacionLaboral.cargo":
						"$historiaLaboral.changeset.cargo",
					sexo: 1,
					activo: 1,
					nacionalidad: 1,
					direccion: 1,
					estadoCivil: 1,
				},
			},
		];
	}

	pipelineAgentesTodos(
		agenteActivoFilters,
		agenteInactivoFilters,
		historiaFilters
	) {
		return [
			// El siguiente pipeline simula una union entre dos colecciones
			// La version 4.4 de mongodb soporta nativamente esta operacion
			// y por lo tanto es mas sencillo de realizar.

			// 1. Keep only one document of the collection.
			{ $limit: 1 },
			// 2. Remove everything from the document.
			{ $project: { _id: "$$REMOVE" } },

			// 4. Lookup collections to union together.
			{
				$lookup: {
					from: "agentes",
					pipeline: this.pipelineAgentesActivos(agenteActivoFilters),
					as: "agentes_activos",
				},
			},

			{
				$lookup: {
					from: "agentes",
					pipeline: this.pipelineAgentesInactivos(
						agenteInactivoFilters,
						historiaFilters
					),
					as: "agentes_inactivos",
				},
			},

			// 4. Union the collections together with a projection.
			{
				$project: {
					union: {
						$concatArrays: [
							"$agentes_activos",
							"$agentes_inactivos",
						],
					},
				},
			},

			// 5. Unwind and replace root so you end up with a result set.
			{ $unwind: "$union" },
			{ $replaceRoot: { newRoot: "$union" } },
		];
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

// UNION SAMPLE
// db.getCollection('agentes').aggregate(
//     [
//       {
//         '$match': {
//           activo: { '$ne': true },
//           historiaLaboral : { '$elemMatch': { 'changeset.cargo.sector.ubicacion':352 }}
//         }
//       },
//       { '$unwind' : "$historiaLaboral" },
//       { '$match': {
//           'historiaLaboral.changeset.cargo.sector.ubicacion':352
//           }
//       },
//       {
//         '$project': {
//           numero: 1,
//           documento: 1,
//           nombre: 1,
//           apellido: 1,
//           'situacionLaboral.cargo.sector.nombre': '$historiaLaboral.changeset.cargo.sector.nombre' ,
//           'situacionLaboral.cargo.ubicacion.nombre': '$historiaLaboral.changeset.cargo.ubicacion.nombre',
//           sexo: 1
//         }
//       },
//       { $unionWith:
//           { coll: "agentes", pipeline:
//               [
//                   {
//                    '$match': {'activo':true, 'situacionLaboral.cargo.sector.ubicacion': 352 }
//                   },
//                    // { '$sort': { 'direccion.localidad.nombre': 1 } },
//                   {
//                     '$project': {
//                       numero: 1,
//                       documento: 1,
//                       nombre: 1,
//                       apellido: 1,
//                       'situacionLaboral.cargo.sector.nombre': 1,
//                       'situacionLaboral.cargo.ubicacion.nombre': 1,
//                       sexo: 1
//                     }
//                   },
//               ]
//           }
//       }
//     ]

//     )
