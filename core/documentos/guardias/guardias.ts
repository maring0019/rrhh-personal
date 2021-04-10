import { Types } from "mongoose";
import * as aqp from 'api-query-params';
import config from '../../../confg';

import { DocumentoPDF } from "../documentos";
import { Guardia } from "../../../modules/guardias/schemas/guardia";


export class DocumentoGuardias extends DocumentoPDF {
    templateName = 'guardias/guardias.ejs';
    outputFilename =  `${config.app.uploadFilesPath}/guardias.pdf`;
    
    getCSSFiles(){
        const html = ["css/style.scss", "css/reports.scss"]
        return this.isPrintable? ["css/reset.scss", ...html, "css/print.scss"] : html;
    }

    getPrintOrientation():'portrait' | 'landscape'{
        return 'landscape';
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

        const guardia_ID = params.filter['_id'];
        if (!guardia_ID) return {};
        const guardias = await Guardia.findById({_id:guardia_ID});
        if (!guardias) return {};
        
        return {
            guardias: guardias,
            //titulo: this.getTitulo(),
            srcImgLogo: this.headerLogo
        }
    }

}