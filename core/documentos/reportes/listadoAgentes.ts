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
		// Recordar que no se puede especificar un agrupamiento??
		let groupField = utils.getQueryParam(query.filter, "$group");
		if (!groupField) groupField = "situacionLaboral.cargo.sector.nombre";
		const groupCondition = {
			_id: `$${groupField}`,
			agentes: { $push: "$$ROOT" },
		};

		// Aggregation Framework Pipeline
		let matchStage: any = this.getMatchStage(query);
		let projectStage = [
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

	/**
	 * Importante!: Aqui se definen los filtros mas relevantes
	 * para el pipeline general
	 * @param filter
	 */
	getFilterConditions(filter): any {
		// El atributo $group no se puede utilizar como filtro
		if (filter && filter.$group) {
			delete filter.$group;
		}
		// Busqueda de agentes en condicion activa
		if (filter && filter.activo === true) {
			let matchAgentesActivos = {
				agenteFilters: { ...filter },
			};
			filter.matchAgentesActivos = matchAgentesActivos;
		}

		// Busqueda de agentes en condicion NO activa
		if (filter && filter.activo && filter.activo.$ne) {
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
			filter.matchAgentesInactivos = matchAgentesInactivos;
		}

		// Busqueda de todos los agentes sin filtro de condicion
		if (filter && !filter.activo) {
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
			filter.matchAgentes = matchAgentes;
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
	getMatchStage(query) {
		// Preparamos las opciones de filtrado
		let filters = this.getFilterConditions(query.filter);
		// Recordar que el filtro por activo es activo=true o activo!=true

		if (filters.matchAgentesActivos) {
			const _f = filters.matchAgentesActivos;
			return this.pipelineAgentesActivos(_f.agenteFilters);
		} else if (filters.matchAgentesInactivos) {
			const _f = filters.matchAgentesInactivos;
			return this.pipelineAgentesInactivos(
				_f.agenteFilters,
				_f.historiaFilters
			);
		} else {
			const _f = filters.matchAgentes;
			return this.pipelineAgentes(
				_f.agenteActivoFilters,
				_f.agenteInactivoFilters,
				_f.historiaFilters
			);
		}
	}

	pipelineAgentesActivos(agenteFilters) {
		return [
			{
				$match: agenteFilters,
			},
		];
	}

	pipelineAgentesInactivos(agenteFilters, historiaFilters) {
		let _f = {
			"historiaLaboral.changeset.cargo.sector.ubicacion":
				historiaFilters["changeset.cargo.sector.ubicacion"],
		};
		return [
			{
				$match: {
					$and: [
						agenteFilters,
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
				$match: _f,
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
				},
			},
		];
	}

	pipelineAgentes(
		agenteActivoFilters,
		agenteInactivoFilters,
		historiaFilters
	) {
		let _f = {
			"historiaLaboral.changeset.cargo.sector.ubicacion":
				historiaFilters["changeset.cargo.sector.ubicacion"],
		};

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
					pipeline: [
						{
							$match: agenteActivoFilters,
						},
					],
					as: "agentes_activos",
				},
			},

			{
				$lookup: {
					from: "agentes",
					pipeline: [
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
							$match: _f,
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
							},
						},
					],
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
