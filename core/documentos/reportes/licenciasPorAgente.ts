import { Types } from "mongoose";
import * as aqp from 'api-query-params';

import { DocumentoPDF } from "../documentos";
import { Agente } from "../../../modules/agentes/schemas/agente";

export class DocumentoLicenciasPorAgente extends DocumentoPDF {
    templateName = 'reportes/agentes-licencias.ejs';
    outputFilename = './licenciasporarticulo.pdf';

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
        
        // Filtros para las licencias
        let anios = this.getFilterField(query.filter, 'anios');
        if (anios) {
            anios = anios.$in? anios.$in: [anios];
        }
        else{
            anios = [];// TODO Raise error (Agregar todas las validaciones necesaras)
        }
        // Preparamos las opciones de filtrado sobre el agente. Removemos filtros no requeridos
        let filterCondition = this.cleanFilters(query.filter);
        
        // Aggregation Framework Pipeline
        let pipeline:any = [
            { $match: filterCondition || {}} ,
            { $lookup: {
                    from: "indicadoresAusentismo",
                    let: { agente_id: "$_id"},
                    pipeline: 
                        [{ 
                            $match: { 
                                $expr: {
                                    $and: [ 
                                        { $eq: ["$$agente_id", "$agente.id"]}, // Join con agente id
                                        { $in: ["$vigencia", anios ]},
                                        ]
                                    },
                                }
                            },
                            { $sort: { vigencia: 1 }}
                            // { $group: { _id: "$articulo.id", ausenciasPorArticulo: { $sum: "$cantidadDias"} } },
                            // { $group: { _id : null, ausenciasTotales: { $sum: "$ausenciasPorArticulo"}, articulos: { $push: "$$ROOT" } } },

                        ],
                    as: "ausentismo"
                 }
            } ,
            { $group: groupCondition},
            { $sort: query.sort || { apellido: 1 }}
        ]

        let gruposAgentes = await Agente.aggregate(pipeline);
        for (const g of gruposAgentes){
            for (const agente of g.agentes) console.log(agente.ausentismo);
        } 

        return { 
                gruposAgente: gruposAgentes,
                anios: anios
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