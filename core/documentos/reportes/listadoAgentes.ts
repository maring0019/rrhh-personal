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
        // Este reporte SI tiene opciones de agrupamiento
        let query = aqp(this.request.query, {
            casters: {
                documentoId: val => Types.ObjectId(val),
              },
              castParams: {
                '_id': 'documentoId',
                'situacionLaboral.cargo._id': 'documentoId'
              }
        })
        // Search Pipeline
        let pipeline:any = [
            { 
                $match: query.filter || {}
            } ,
            { 
                $project: query.projection || { numero: 1, documento:1, nombre: 1, apellido: 1, sexo: 1} // Agregar LT, Servicio
            } ,
            { 
                $group : { _id : "$sexo", agentes: { $push: "$$ROOT" } } 
            },
            {
                $sort: query.sort || { apellido: 1 }
            }
        ]

        let agentes = await Agente.aggregate(pipeline);
        return { gruposAgente: agentes }
    }
}