import { DocumentoPDF } from './documentos';
import { Types } from 'mongoose';
import { AusenciaPeriodo } from '../../modules/ausentismo/schemas/ausenciaPeriodo';
import { Agente } from '../../modules/agentes/schemas/agente';
import { FilesModel } from '../tm/schemas/imagenes';


export class DocumentoConstanciaCertificado extends DocumentoPDF {

    templateName = 'ausentismo/constancia-certificado.ejs';
    outputFilename = './constanciaCertificado.pdf';

    generarCSS() {
        return '';
    }
    

    async getContextData(){
        const id = this.request.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) return {}
        
        console.log('Buscando Ausentismo')
        const ausentismo = await AusenciaPeriodo.findById(id).lean();
        console.log(ausentismo)
        if(!ausentismo) return {}

        console.log('Buscando Agente')
        const agente = await Agente.findById(ausentismo.agente.id);
        console.log(agente)
        if(!agente) return {}

        console.log('Buscando Imagen')
        const filesModel = FilesModel();
        const files = await filesModel.find({ 'metadata.objID': new Types.ObjectId(ausentismo._id)});
        console.log(files)
        let file:any;
        if (files && files.length){
            file = files[0]
        }

        
        const fechaHora = this.todayFormatted();

        const srcImgCertificado  = `/api/core/files/objects/${ausentismo._id}/files/${file._id}/download`;
        console.log('Imagen de descarga');
        console.log(srcImgCertificado);  

        return {
            fechaHora: fechaHora,
            agente: agente,
            srcImgCertificado: srcImgCertificado
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