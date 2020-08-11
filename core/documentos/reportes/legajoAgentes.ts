import { DocumentoPDF } from "../documentos";
import { Agente } from "../../../modules/agentes/schemas/agente";
import { Types } from "mongoose";
import * as aqp from 'api-query-params';

// TODO Falta implementar el tema de las bajas!!!
// Faltan crear los indices por defecto

export class DocumentoLegajoAgente extends DocumentoPDF {
    templateName = 'reportes/agentes-legajo.ejs';
    outputFilename = './legajo.pdf';

    generarCSS() {
        return '';
    }
    
    async getContextData(){
        let agentes = [];
        try{
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
                { $match: query.filter || {}} ,
                { $sort: query.sort || { apellido: 1 }}
            ]
            agentes = await Agente.aggregate(pipeline);
            return { agentes: agentes }
        }
        catch{
            return { agentes: agentes }
        }
        
    }
}