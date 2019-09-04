import { DocumentoPDF } from "../documentos";
import { Agente } from "../../../modules/agentes/schemas/agente";
import { Types } from "mongoose";
import * as aqp from 'api-query-params';


export class DocumentoListadoAgentes extends DocumentoPDF {
    templateName = 'reportes/agentes-listado.ejs';
    outputFilename = './listado.pdf';

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
                'situacionLaboral.cargo.sector._id': 'documentoId'
              }
        })

        // Por defecto estos campos siempre van a mostrar en el reporte
        const defaultProjection = { 
            'numero': 1,
            'documento':1,
            'nombre': 1,
            'apellido': 1, 
            // 'situacionLaboral.cargo.sector.nombre': 1,
            'situacionLaboral': 1,
            // 'situacionLaboral.cargo.servicio.nombre': 1,
            }
        // Identificamos el campo por el cual agrupar. Si no se especifico agregamos
        // uno por defecto
        let groupField = this.getGroupCondition(query);
        if (!groupField) groupField = 'situacionLaboral.cargo.sector.nombre';
        const groupCondition = { _id : `$${groupField}`, agentes: { $push: "$$ROOT" } } 
        
        // Preparamos las opciones de filtrado
        let filterCondition = this.deleteGroupFromFilter(query.filter);

        
        // Aggregation Framework Pipeline
        let pipeline:any = [
            {
                $match: filterCondition || {}
            } ,
            {
                $sort: query.sort || { apellido:1 }
            },
            { 
                $project: defaultProjection // { ...query.projection, ...defaultProjection, ...{ [groupField]: 1}  }
            } ,
            { 
                $group : groupCondition
            },
            {
                $sort: query.sort || { _id:1 }
            }
        ]

        let gruposAgentes = await Agente.aggregate(pipeline);

        // console.log(gruposAgentes)
        // Cast agentes into Agente type !Malisimo
        // gruposAgentes = gruposAgentes.map(grupo => {
        //     grupo.agentes = grupo.agentes.map(a=>new Agente(a));
        //     return grupo;
        // });
        console.log(gruposAgentes[1].agentes[0])
        return { 
                gruposAgente: gruposAgentes,
                extraFields: this.projectionToArray(query.projection)
            }
    }

    /**
     * La libreria api-query-params no cuenta con la opcion de definir un campo
     * para agrupamiento. Por este motivo utilizamos el campo especial $group
     * para esta opcion. El campo por defecto se agrega al listado de filtros,
     * por eso lo obtenemos con esta utilidad. Posteriormente hay que eliminar
     * el campo manualmente de los filtros
     * @param query 
     */
    getGroupCondition(query){
        let group = '';
        if (query.filter && query.filter.$group){
            group = query.filter.$group
        }
        return group;
    }

    deleteGroupFromFilter(filter){
        if (filter && filter.$group){
            delete filter.$group;
        }
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