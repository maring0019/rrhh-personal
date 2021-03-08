import { Types } from "mongoose";
import * as aqp from 'api-query-params';
import config from '../../../confg';

import { DocumentoPDF } from "../documentos";
import { HoraExtra } from "../../../modules/horas_extras/schemas/horaextra";


export class DocumentoHorasExtras extends DocumentoPDF {
    templateName = 'horas_extras/horas_extras.ejs';
    outputFilename =  `${config.app.uploadFilesPath}/horas-extras.pdf`;
    
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

        const hora_extra_ID = params.filter['_id'];
        if (!hora_extra_ID) return {};
        const horas_extras = await HoraExtra.findById({_id:hora_extra_ID});
        if (!horas_extras) return {};
        
        return {
            horas_extras: horas_extras,
            //titulo: this.getTitulo(),
            srcImgLogo: this.headerLogo
        }
    }

}