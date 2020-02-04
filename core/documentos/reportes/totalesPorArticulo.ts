import { Types } from "mongoose";
import * as aqp from 'api-query-params';

import { DocumentoPDF } from "../documentos";
import { Agente } from "../../../modules/agentes/schemas/agente";
import { Articulo } from "../../../modules/ausentismo/schemas/articulo";
import * as utils from "../utils";

export class DocumentoAusenciasTotalesPorArticulo extends DocumentoPDF {
    templateName = 'reportes/agentes-ausencias-por-articulo.ejs';
    outputFilename = './totalesporarticulo.pdf';

    generarCSS() {
        return '';
    }
    
    async getContextData(){ 
        // Recuperamos todas las opciones para el reporte (filtros, orden, etc)
        let query = aqp(this.request.query, {
            casters: {
                documentoId: val => Types.ObjectId(val),
              },
              castParams: {
                '_id': 'documentoId',
                'situacionLaboral.cargo.sector._id': 'documentoId',
                'articulos': 'documentoId'
              }
        })
        // Identificamos el campo por el cual agrupar. Si no se especifico agregamos
        // uno por defecto
        let groupField = utils.getQueryParam(query.filter, '$group');
        if (!groupField) groupField = 'situacionLaboral.cargo.sector.nombre';
        const groupCondition = { _id : `$${groupField}`, agentes: { $push: "$$ROOT" } }
        
        // Filtros para el ausentismo
        let fechaDesde = utils.getQueryParam(query.filter, 'fechaDesde'); // Format 2016-01-01
        let fechaHasta = utils.getQueryParam(query.filter, 'fechaHasta');
        let articulosIds = utils.getQueryParam(query.filter, 'articulos');
        if (articulosIds) {
            articulosIds = articulosIds.$in? articulosIds.$in: [articulosIds];
        }
        else{
            articulosIds = [];
        }
        // Preparamos las opciones de filtrado sobre el agente. Removemos filtros no requeridos
        let filterCondition = utils.cleanFilters(query.filter);
        
        // Aggregation Framework Pipeline
        let pipeline:any = [
            { $match: filterCondition || {}},
            { $sort: query.sort || { apellido: 1 }},
            { $lookup: {
                    from: "ausenciasperiodo",
                    let: { agente_id: "$_id", fecha_desde: fechaDesde, fecha_hasta: fechaHasta},
                    pipeline: 
                        [{ 
                            $match: { 
                                $expr: {
                                    $and: [ 
                                        { $eq: ["$$agente_id", "$agente._id"]}, // Join con agente id
                                        (articulosIds.length)?{ $in: ["$articulo._id", articulosIds ]}:{},
                                        { $gte: ["$fechaDesde", "$$fecha_desde"]},
                                        { $lte: ["$fechaHasta", "$$fecha_hasta"]}
                                        ]
                                    },
                                }
                            },
                            { $group: { _id: "$articulo._id", ausenciasPorArticulo: { $sum: "$cantidadDias"} } },
                            { $group: { _id : null, ausenciasTotales: { $sum: "$ausenciasPorArticulo"}, articulos: { $push: "$$ROOT" } } },

                        ],
                    as: "ausentismo"
                 }
            } ,
            { $group: groupCondition},
            { $sort: { _id:1 }}
        ]

        let gruposAgentes = await Agente.aggregate(pipeline);
        let articulos = await Articulo.find((articulosIds.length)?{"_id": { $in: articulosIds }}:{}).sort({ codigo: 1});

        return { 
                gruposAgente: gruposAgentes,
                articulos: articulos
            }
    }

}