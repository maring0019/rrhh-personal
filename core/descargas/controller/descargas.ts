import BaseDocumentoController from '../../app/basedocumentocontroller';

import { DocumentoConstanciaCertificado } from '../../../core/documentos/constanciaCertificado';
import { DocumentoCredencialAgente } from '../../../core/documentos/credencialAgente';
import { DocumentoAusenciasPorAgente } from '../../../core/documentos/reportes/ausenciasPorAgente';


class DescargasController extends BaseDocumentoController {

    constructor(){
        super();
        this.getCredencial = this.getCredencial.bind(this);
        this.downloadCredencial = this.downloadCredencial.bind(this);
        this.getCertificado = this.getCertificado.bind(this);
        this.downloadCertificado = this.downloadCertificado.bind(this);
    }

    async getCredencial(req, res, next, options = null) {
        try {
            let doc = new DocumentoCredencialAgente();
            return await this.getDocumentoHTML(req, res, next, doc);
        }
        catch(err){
            return next(err);
        }
    }

    async downloadCredencial(req, res, next, options = null) {
        try {
            let doc = new DocumentoCredencialAgente();
            return await this.downloadDocumentoPDF(req, res, next, doc);
        }
        catch(err){
            return next(err);
        }
    }

    async getCertificado(req, res, next) {
        try {
            let doc = new DocumentoConstanciaCertificado();
            return await this.getDocumentoHTML(req, res, next, doc);
        }
        catch(err){
            return next(err);
        }    
    }

    async downloadCertificado(req, res, next, options = null) {
        try {
            let doc = new DocumentoConstanciaCertificado();
            return await this.downloadDocumentoPDF(req, res, next, doc);
        }
        catch(err){
            return next(err);
        }
    }


    async getPartes(req, res, next) {
        try {
            let doc = new DocumentoAusenciasPorAgente();
            return await this.getDocumentoHTML(req, res, next, doc);
        }
        catch(err){
            return next(err);
        }    
    }

    async downloadPartes(req, res, next, options = null) {
        try {
            let doc = new DocumentoAusenciasPorAgente();
            return await this.downloadDocumentoPDF(req, res, next, doc);
        }
        catch(err){
            return next(err);
        }
    }
    

}

export default DescargasController;