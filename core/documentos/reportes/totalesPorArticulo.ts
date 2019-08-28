import { Types } from "mongoose";
import * as aqp from 'api-query-params';

import { DocumentoPDF } from "../documentos";
import { Agente } from "../../../modules/agentes/schemas/agente";
import { Articulo } from "../../../modules/ausentismo/schemas/articulo";

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
        let groupField = this.getFilterField(query.filter, '$group');
        if (!groupField) groupField = 'situacionLaboral.cargo.sector.nombre';
        const groupCondition = { _id : `$${groupField}`, agentes: { $push: "$$ROOT" } }
        
        // Filtros para el ausentismo
        let fechaDesde = this.getFilterField(query.filter, 'fechaDesde'); // Format 2016-01-01
        let fechaHasta = this.getFilterField(query.filter, 'fechaHasta');
        let articulosIds = this.getFilterField(query.filter, 'articulos');
        if (articulosIds) {
            articulosIds = articulosIds.$in? articulosIds.$in: [articulosIds];
        }
        else{
            articulosIds = [];
        }
        // Preparamos las opciones de filtrado sobre el agente. Removemos filtros no requeridos
        let filterCondition = this.cleanFilters(query.filter);
        
        // Aggregation Framework Pipeline
        let pipeline:any = [
            { $match: filterCondition || {}} ,
            { $lookup: {
                    from: "ausenciasperiodo",
                    let: { agente_id: "$_id", fecha_desde: fechaDesde, fecha_hasta: fechaHasta},
                    pipeline: 
                        [{ 
                            $match: { 
                                $expr: {
                                    $and: [ 
                                        { $eq: ["$$agente_id", "$agente.id"]}, // Join con agente id
                                        { $gte: ["$fechaDesde", "$$fecha_desde"]},
                                        { $lte: ["$fechaHasta", "$$fecha_hasta"]},
                                        (articulosIds.length)?{ $in: ["$articulo.id", articulosIds ]}:{}
                                        ]
                                    },
                                }
                            },
                            { $group: { _id: "$articulo.id", ausenciasPorArticulo: { $sum: "$cantidadDias"} } },
                            { $group: { _id : null, ausenciasTotales: { $sum: "$ausenciasPorArticulo"}, articulos: { $push: "$$ROOT" } } },

                        ],
                    as: "ausentismo"
                 }
            } ,
            { $group: groupCondition},
            { $sort: query.sort || { apellido: 1 }}
        ]

        let gruposAgentes = await Agente.aggregate(pipeline);
        let articulos = await Articulo.find((articulosIds.length)?{"_id": { $in: articulosIds }}:{}).sort({ codigo: 1});

        return { 
                gruposAgente: gruposAgentes,
                articulos: articulos,
            }
    }



    getFilterField(filter, filterCondition ){
        let filterField;
        if (filter && filter[filterCondition]){
            filterField = filter[filterCondition];
        }
        return filterField;
    }

    cleanFilters(filter){
        let whitelist = ['_id']
        Object.keys(filter).forEach(field => {
            if (whitelist.indexOf(field)<0) delete filter[field];        
        });
        return filter;
    }

    projectionToArray(extraFields){
        let output = [];
        Object.keys(extraFields).forEach(field => {
            output.push(field);
        });
        return output;
    }
}