import { Types } from "mongoose";
import * as aqp from 'api-query-params';

import { DocumentoPDF } from "../documentos";
import { Agente } from "../../../modules/agentes/schemas/agente";
import { Articulo } from "../../../modules/ausentismo/schemas/articulo";

import * as utils from "../utils";
import config from '../../../confg';


export class DocumentoAusenciasPorAgente extends DocumentoPDF {
    outputFilename = `${config.app.uploadFilesPath}/ausenciasporagente.pdf`;
    templateName = 'reportes/agentes-ausencias.ejs';

    getCSSFiles(){
        return this.isPrintable? ["css/reset.scss", "css/reports.scss", "css/print.scss"] : ["css/reports.scss"];
    }

    async encabezadoFiltrosAplicados(){
        // Recuperamos los filtros aplicados
        const query = this.getQueryOptions();
        let articulosIds = utils.getQueryParam(query.filter, 'articulos');
        const fechaDesde = utils.getQueryParam(query.filter, 'fechaDesde');
        const fechaHasta = utils.getQueryParam(query.filter, 'fechaHasta')
        
        // Identificamos los articulos seleccionados
        let articulosText = []
        if (articulosIds){
            articulosIds = articulosIds.$in? articulosIds.$in: [articulosIds];
            const articulos:any = await Articulo.find({ _id: {$in: articulosIds}});
            for (const art of articulos) {
                articulosText.push(art.nombre)
            }
        }
        else{
            articulosText = ['---'];
        }

        // Retornamos el objeto con todas las opciones de filtrado
        return {
            fechaDesde:{ label: "Fecha Desde", value: this.printUtils.formatDate(fechaDesde, 'utc')},
            fechaHasta:{ label: "Fecha Hasta", value: this.printUtils.formatDate(fechaHasta, 'utc')},
            articulos: { label: "Articulos", value: articulosText.join(", ")}
        };
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
        fechaHasta = new Date(fechaHasta.setDate(fechaHasta.getDate() + 1 ));// Add 1 day
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
                            "articulo._id": filterArticulos,
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
                            "_id" : { "ausentismo": "$_id", "agente":"$agente._id", "articulo":"$articulo.codigo","observacion":"$observacion","extra":"$extra"},
                            "totalAusencias" : { $sum: 1 },
                            "fechaInicio": { $min: "$ausencias.fecha" },
                            "fechaFin": { $max: "$ausencias.fecha" },
                            }
                        },
                        { $match:{ totalAusencias: { $gt: 0}} },
                        { $sort: { fechaInicio: 1 }}            
                    ],
                as: "ausentismo"
                }
            },
            { $match: { ausentismo: { $not:{ $size: 0 }}}},
            { $group: groupCondition},
            { $sort: { _id:1 }}
        ]
    
        let gruposAgentes = await Agente.aggregate(pipeline);
    
    
        return { 
            gruposAgente: gruposAgentes,
            srcImgLogo: this.headerLogo,
            filtros: await this.encabezadoFiltrosAplicados()
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