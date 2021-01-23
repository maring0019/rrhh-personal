import { Types } from "mongoose";
import * as aqp from 'api-query-params';
import config from '../../../confg';

import { DocumentoPDF } from "../documentos";
import { Parte } from "../../../modules/partes/schemas/parte";
import ParteController from "../../../modules/partes/controller/parte";
import { Agente } from "../../../modules/agentes/schemas/agente";

const controller = new ParteController(Parte);

export class DocumentoFichadasAgente extends DocumentoPDF {
    templateName = 'partes/fichadas-agentes.ejs';
    outputFilename =  `${config.app.uploadFilesPath}/fichadasagentes.pdf`;

    generarCSS() {
        return '';
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
        // Recuperamos el agente si se indico en los parametros de busqueda
        let agente;
        const agenteID = params.filter['agente._id'];
        if (agenteID) agente = await Agente.findById(agenteID);
        
        // Delegamos en el controller la busqueda de las fichadas, ya que
        // se trata de la misma busqueda que se realiza desde el front
        const fichadas = await controller.queryFichadasAgentes(this.request);
        
        return {
                fechaDesde: params.filter.fecha.$gte,
                fechaHasta: params.filter.fecha.$lte,
                agente: agente,
                fichadas: fichadas,
                srcImgLogo: this.headerLogo
            }
    }
}