import { DocumentoPDF } from "../documentos";
import { Agente } from "../../../modules/agentes/schemas/agente";
import { Types } from "mongoose";
import * as aqp from 'api-query-params';


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
        // 5d4c39d2b49d352384756dfc
        // Identificamos el campo por el cual agrupar. Si no se especifico agregamos
        // uno por defecto
        let groupField = this.getFilterField(query.filter, '$group');
        if (!groupField) groupField = 'situacionLaboral.cargo.sector.nombre';
        const groupCondition = { _id : `$${groupField}`, agentes: { $push: "$$ROOT" } }
  
        let fechaDesde = this.getFilterField(query.filter, 'fechaDesde'); // Format 2016-01-01
        let fechaHasta = this.getFilterField(query.filter, 'fechaHasta');
        let articulos = this.getFilterField(query.filter, 'articulos');
        let articulosIds = [];
        console.log(articulosIds)
        if (articulos){
            articulosIds = articulos.$in? articulos.$in: [articulos];
        }
    
        // Preparamos las opciones de filtrado. Removemos filtros no requeridos
        let filterCondition = this.cleanFilters(query.filter);

        
        // Aggregation Framework Pipeline
        let pipeline:any = [
            { 
                $match: filterCondition || {}
            } ,
            { 
                $lookup: {
                    from: "ausenciasperiodo",
                    let: { agente_id: "$_id", fecha_desde: fechaDesde, fecha_hasta: fechaHasta},
                    pipeline: [
                        {
                            $match: 
                                {
                                    $expr: {
                                        $and:
                                            [ 
                                                { $eq: ["$$agente_id", "$agente.id"]}, // Join con agente id
                                                { $gte: ["$fechaDesde", "$$fecha_desde"]},
                                                { $lte: ["$fechaHasta", "$$fecha_hasta"]},
                                                // { $in: ["$articulo.id", articulosIds ] }
                                            ]
                                    },
                                
                                }
                        },
                        {
                            $group:{ _id: "$articulo", total: { $sum: "$cantidadDias"} }
                        }
                    ],
                    as: "ausentismo"
                 }
            } ,
            { 
                $group : groupCondition
            },
            {
                $sort: query.sort || { apellido: 1 }
            }
        ]

        let gruposAgentes = await Agente.aggregate(pipeline);

        // console.log(gruposAgentes[0]);
        console.log('###############################################')
        console.log(gruposAgentes[0].agentes[0].ausentismo);
        // Cast agentes into Agente type !Malisimo
        // gruposAgentes = gruposAgentes.map(grupo => {
        //     grupo.agentes = grupo.agentes.map(a=>new Agente(a));
        //     return grupo;
        // });
        // return { 
        //         gruposAgente: gruposAgentes,
        //         extraFields: this.projectionToArray(query.projection)
        //     }
        return {};
    }

    /**
     * La libreria api-query-params no cuenta con la opcion de definir un campo
     * para agrupamiento. Por este motivo utilizamos el campo especial $group
     * para esta opcion. El campo por defecto se agrega al listado de filtros,
     * por eso lo obtenemos con esta utilidad. Posteriormente hay que eliminar
     * el campo manualmente de los filtros
     * @param query 
     */
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