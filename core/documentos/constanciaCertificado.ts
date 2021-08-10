import { Types } from 'mongoose';
import * as aqp from 'api-query-params';

import { DocumentoPDF } from './documentos';
import { AusenciaPeriodo } from '../../modules/ausentismo/schemas/ausenciaperiodo';
import { Agente } from '../../modules/agentes/schemas/agente';
import { FilesModel } from '../tm/schemas/imagenes';

import config from '../../confg';


export class DocumentoConstanciaCertificado extends DocumentoPDF {

    templateName = 'ausentismo/constancia-certificado.ejs';
    outputFilename = `${config.app.uploadFilesPath}/constanciaCertificado.pdf`;

    getCSSFiles() {
        return this.isPrintable ? ['css/reset.scss'] : [];
    }


    async getContextData() {
        const token = this.request.token;
        // Recuperamos los parametros de busqueda aplicados
        let params = aqp(this.request.query, {
            casters: {
                documentoId: val => Types.ObjectId(val),
            },
            castParams: {
                _id: 'documentoId'
            }
        });
        const id = params.filter['_id'];
        if (!id || (id && !Types.ObjectId.isValid(id))) { return {}; }

        const ausentismo: any = await AusenciaPeriodo.findById(id).lean();
        if (!ausentismo) { return {}; }

        const agente = await Agente.findById(ausentismo.agente._id);
        if (!agente) { return {}; }

        let srcImgCertificado;
        if (ausentismo.extra) {
            // Vamos a intentar obtener la info del medico y demas dato
            // del certificado (sin imagen/escaneo del certificado) para
            // incluirla en la impresion
        } else {

            // Vamos a intentar recuperar si existe el certificado adjunto
            // para incluirlo en la impresion
            const filesModel = FilesModel();
            const files = await filesModel.find({ 'metadata.objID': new Types.ObjectId(ausentismo._id) }).toArray();
            let file: any;
            if (files && files.length) {
                for (const f of files) { // Si hay mas de un archivo procesamos el ultimos¿?
                    if (f.contentType === 'image/jpeg') {
                        file = f;
                    }
                }
            }
            if (file) {
                srcImgCertificado = `${config.app.url}:${config.app.port}/api/core/files/objects/${ausentismo._id}/files/${file._id}/download?token=${token}`;
            }
        }
        const fechaHora = this.todayFormatted();
        return {
            fechaHora,
            agente,
            extraInfo: ausentismo.extraInfo,
            srcImgCertificado,
            srcImgLogo: this.headerLogo
        };
    }


    todayFormatted(): String {
        let date = new Date();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
}
