import { Types } from 'mongoose';
import * as aqp from 'api-query-params';

import { DocumentoPDF } from './documentos';
import { Agente } from '../../modules/agentes/schemas/agente';
import { makeFs } from '../../core/tm/schemas/imagenes';

import config from '../../confg';


export class DocumentoCredencialAgente extends DocumentoPDF {
    templateName = 'credencial/agente-credencial.ejs';
    outputFilename = `${config.app.uploadFilesPath}/credencialAgente.pdf`;

    getCSSFiles() {
        return this.isPrintable ? ['css/reset.scss', 'css/style.scss'] : ['css/style.scss'];
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
        // Validamos los parametros de busqueda ingresados y recuperamos los agentes de interes
        let cleanIds: any;
        const ids = params.filter['_ids'];
        if (!ids) { return {}; }
        if (!ids.$in) {
            cleanIds = (Types.ObjectId.isValid(ids)) ? [ids] : null;
        } else {
            cleanIds = ids.$in.filter(id => Types.ObjectId.isValid(id));
        }
        if (!cleanIds || !cleanIds.length) { return {}; }
        const agentes: any = await Agente.find({ _id: { $in: cleanIds } }).lean();
        if (!agentes || !agentes.length) { return {}; }

        // Por cada agente vamos a recuperar info extra necesaria para las crendenciales
        let srcImgCredenciales = [];
        let servicios = [];
        let funciones = [];
        const agenteFotoModel = makeFs();
        for (const agente of agentes) {

            // Recuperamos la foto de cada agente
            const files = await agenteFotoModel.find({ 'metadata.agenteID': new Types.ObjectId(agente._id) }).toArray();
            let file: any;
            if (files && files.length) {
                for (const f of files) { // Si hay mas de un archivo procesamos el ultimos¿?
                    if (f.contentType === 'image/jpg') {
                        file = f;
                    }
                }
            }

            if (file) {
                srcImgCredenciales.push(`${config.app.url}:${config.app.port}/api/modules/agentes/agentes/${agente._id}/fotos?attachment=true&token=${token}`);
            } else {
                srcImgCredenciales.push(`${config.app.url}:${config.app.port}/static/images/user.jpg`);
            }
            // Identificamos funcion y servicio de cada agente
            const cargo = agente.situacionLaboral ? agente.situacionLaboral.cargo : null;
            funciones.push(cargo ? cargo.subpuesto.nombre : '');
            servicios.push(cargo ? cargo.servicio.nombre : '');

        }

        return {
            agentes,
            funciones,
            servicios,
            srcImgCredenciales,
            srcImgLogoSmall: `${config.app.url}:${config.app.port}/static/images/logo_small.jpeg`
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
