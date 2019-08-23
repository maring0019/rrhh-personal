import { DocumentoPDF } from "../documentos";
import { Agente } from "../../../modules/agentes/schemas/agente";
import { Types } from "mongoose";
import * as aqp from 'api-query-params';


export class DocumentoLegajoAgente extends DocumentoPDF {
    templateName = 'reportes/legajo.ejs';
    outputFilename = './legajo.pdf';

    generarCSS() {
        return '';
    }
    
    async getContextData(){
        // Este reporte no tiene opciones de agrupamiento
        let query = aqp(this.request.query, {
            casters: {
                documentoId: val => Types.ObjectId(val),
              },
              castParams: {
                '_id': 'documentoId',
                'situacionLaboral.cargo.sector._id': 'documentoId'
              }
        })
        // Search Pipeline
        let pipeline:any = [
            { 
                $match: query.filter || {}
            } ,
            {
                $sort: query.sort || { apellido: 1 }
            }
        ]

        let agentes = await Agente.aggregate(pipeline);
        return { agentes: agentes }
    }
}