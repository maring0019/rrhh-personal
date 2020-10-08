import { Types } from "mongoose";
import * as aqp from 'api-query-params';

import { DocumentoPDF } from "../documentos";
import { Agente } from "../../../modules/agentes/schemas/agente";

import * as utils from "../utils";
import config from '../../../confg';


export class DocumentoAusenciasPorAgente extends DocumentoPDF {
    templateName = 'reportes/agentes-ausencias.ejs';
    outputFilename = `${config.app.uploadFilesPath}/ausenciasporagente.pdf`;

    generarCSS() {
        return '';
    }
    
    async getContextData(){
        // Recuperamos todas las opciones para el reporte (filtros, orden, etc)
        let query = this.getQueryOptions();
        
        // Identificamos el campo por el cual agrupar. Si no se especifico agregamos
        // uno por defecto
        let groupField = utils.getQueryParam(query.filter, '$group');
        if (!groupField) groupField = 'situacionLaboral.cargo.sector.nombre';
        const groupCondition = { _id : `$${groupField}`, agentes: { $push: "$$ROOT" } }
        
        // Filtros para el ausentismo
        let fechaDesde = utils.getQueryParam(query.filter, 'fechaDesde'); // Format 2016-01-01
        let fechaHasta = utils.getQueryParam(query.filter, 'fechaHasta');
        let articulosIds = utils.getQueryParam(query.filter, 'articulos');
        let filterArticulos: any = { $ne : null };
        if (articulosIds) {
            articulosIds = articulosIds.$in? articulosIds.$in: [articulosIds];
            filterArticulos = { $in : articulosIds }
        }
        // Preparamos las opciones de filtrado sobre el agente. Removemos filtros no requeridos
        let filterCondition = utils.cleanFilters(query.filter);
        
        // Aggregation Framework Pipeline
        let pipeline:any = [
            { $match: filterCondition || {}} ,
            { $sort: query.sort || { apellido: 1 }},
            { $lookup: {
                from: "ausenciasperiodo",
                let: { agente_id: "$_id" },
                pipeline: 
                    [  { $match:{ 
                            "$expr" : { $eq : ["$agente._id", "$$agente_id" ] }, // 'Join' con agentes
                            "fechaHasta": { $gte: fechaDesde },
                            "fechaDesde": { $lte: fechaHasta },
                            "articulo._id": filterArticulos
                            } 
                        },
                        { $unwind : "$ausencias"},
                        { $match: { 
                             "ausencias.fecha": { 
                                 $gte: fechaDesde, 
                                 $lte: fechaHasta
                                }
                            }
                        },
                        { $group: {
                            "_id" : { "ausentismo": "$_id", "agente":"$agente._id", "articulo":"$articulo.codigo" },
                            "totalAusencias" : { $sum: 1 },
                            "fechaInicio": { $min: "$ausencias.fecha" },
                            "fechaFin": { $max: "$ausencias.fecha" }
                            }
                        },
                    ],
                as: "ausentismo"
                }
            },
            { $group: groupCondition},
            { $sort: { _id:1 }}
        ]
    
        let gruposAgentes = await Agente.aggregate(pipeline);
    
        return { 
            gruposAgente: gruposAgentes,
            srcImgLogo: this.headerLogo
            }
    }

    /**
	 * Recupera todo los query parameters del request.
	 * Filtros, orden, campos a mostrar, etc
	 */
	getQueryOptions() {
        return aqp(this.request.query, {
            casters: {
                documentoId: val => Types.ObjectId(val),
              },
              castParams: {
                '_id': 'documentoId',
                'situacionLaboral.cargo.sector._id': 'documentoId',
                'articulos': 'documentoId'
              }
        })
    }
}