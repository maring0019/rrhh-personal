import { Types } from "mongoose";
import * as aqp from 'api-query-params';
import config from '../../../confg';

import { DocumentoPDF } from "../documentos";
import { Parte } from "../../../modules/partes/schemas/parte";
import ParteController from "../../../modules/partes/controller/parte";
import { Agente } from "../../../modules/agentes/schemas/agente";

const controller = new ParteController(Parte); 

export class DocumentoParteDiarioAgente extends DocumentoPDF {
    templateName = 'partes/partes-diario-agente.ejs';
    outputFilename =  `${config.app.uploadFilesPath}/partediarioagente.pdf`;

    getCSSFiles(){
        const html = ["css/style.scss", "css/reports.scss"]
        return this.isPrintable? ["css/reset.scss", ...html] : html;
    }
    
    async getContextData(){
        // Recuperamos los parametros de busqueda aplicados
        let params = aqp(this.request.query, {
            casters: {
                documentoId: val => Types.ObjectId(val),
              },
              castParams: {
                'agente._id': 'documentoId'
              }
        });
        
        const agente = await Agente.findById(params.filter['agente._id']);
        // Delegamos en el controller la busqueda de los partes, ya que
        // se trata de la misma busqueda que se realiza desde el front
        const partes = await controller.queryPartesAgente(this.request);
        
        return {
                fechaDesde: params.filter.fecha.$gte,
                fechaHasta: params.filter.fecha.$lte,
                agente: agente, 
                partes: partes,
                srcImgLogo: this.headerLogo
            }
    }
}