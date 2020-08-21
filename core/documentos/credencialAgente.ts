import { Types } from 'mongoose';
import * as aqp from 'api-query-params';

import { DocumentoPDF } from './documentos';
import { Agente } from '../../modules/agentes/schemas/agente';
import { makeFs } from '../../core/tm/schemas/imagenes';

import config from '../../confg';


export class DocumentoCredencialAgente extends DocumentoPDF {

    templateName = 'credencial/agente-credencial.ejs';
    outputFilename = `${config.app.uploadFilesPath}/credencialAgente.pdf`;

    // generarCSS() {
    //     return '';
    // }
    

    async getContextData(){
        const token = this.request.token;
        // Recuperamos los parametros de busqueda aplicados
        let params = aqp(this.request.query, {
            casters: {
                documentoId: val => Types.ObjectId(val),
              },
              castParams: {
                '_id': 'documentoId'
              }
        });
        const id = params.filter['_id'];
        // const id = this.request.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) return {}
        
        const agente:any = await Agente.findById(id).lean();
        if(!agente) return {}

        let srcImgCredencial='';
        
        const agenteFotoModel = makeFs();
        const files = await agenteFotoModel.find({ 'metadata.agenteID': new Types.ObjectId(agente._id) });
        let file:any;
        if (files && files.length){
            for (const f of files){ // Si hay mas de un archivo procesamos el ultimos¿?
                if (f.contentType =='image/jpg'){
                    file = f;
                } 
            }
        }
        if (file){
            srcImgCredencial = `${config.app.url}:${config.app.port}/api/modules/agentes/agentes/${agente._id}/fotos?attachment=true&token=${token}`;
        }
        else{
            srcImgCredencial = `${config.app.url}:${config.app.port}/static/images/user.jpg`
        }
        const cargo = agente.situacionLaboral? agente.situacionLaboral.cargo : null;
        return {
            agente: agente,
            funcion: cargo? cargo.subpuesto.nombre : '',
            servicio: cargo? cargo.servicio.nombre: '',
            srcImgCredencial: srcImgCredencial,
            srcImgLogo: `${config.app.url}:${config.app.port}/static/images/logo_hospital.jpeg`
        }
    }


    todayFormatted():String{
        let date = new Date();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
}