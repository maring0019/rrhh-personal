import { Types } from "mongoose";
import * as aqp from 'api-query-params';
import config from '../../../confg';

import { DocumentoPDF } from "../documentos";
import { Recargo } from "../../../modules/recargos/schemas/recargo";


export class DocumentoRecargos extends DocumentoPDF {
    templateName = 'recargos/recargos.ejs';
    outputFilename =  `${config.app.uploadFilesPath}/recargos-periodo.pdf`;

    protected getOutputFilename() {
		return this.outputFilename;
    }
    
    getCSSFiles(){
        const html = ["css/style.scss", "css/reports.scss"]
        return this.isPrintable? ["css/reset.scss", ...html, "css/print.scss"] : html;
    }

    async getContextData(){
        // Recuperamos los parametros de busqueda aplicados
        let params = aqp(this.request.query, {
            casters: {
                documentoId: val => Types.ObjectId(val),
              },
              castParams: {
                '_id': 'documentoId'
              }
        });

        const recargoID = params.filter['_id'];
        if (!recargoID) return {};
        const recargo = await Recargo.findById({_id:recargoID});
        if (!recargo) return {};
        
        return {
            recargo: this.getRecargosFiltrados(recargo),
            titulo: this.getTitulo(),
            srcImgLogo: this.headerLogo
        }
    }

    getTitulo(){
        return "Adicional por Recargos Extraordinarios";
    }

    /**
     * Retornamos todos los recargos, menos los excedidos
     * @param recargo 
     */
    getRecargosFiltrados(recargo){
        let agentesExcedidos = []
        for (const itemAgente of recargo.planilla) {
            if (itemAgente.items.length>7){
                const newItems = itemAgente.items.slice(0, 7);
                itemAgente.items = newItems;
                agentesExcedidos.push(itemAgente);
            }
            else{
              agentesExcedidos.push(itemAgente);
            }
        }
        recargo.planilla = agentesExcedidos;
        return recargo;
    }
}