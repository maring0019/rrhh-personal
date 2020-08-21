import BaseDocumentoController from '../../../core/app/basedocumentocontroller';

import { DocumentoLegajoAgente } from "../../../core/documentos/reportes/legajoAgentes";
import { DocumentoListadoAgentes } from "../../../core/documentos/reportes/listadoAgentes";
import { DocumentoAusenciasTotalesPorArticulo } from "../../../core/documentos/reportes/totalesPorArticulo";

import { DocumentoAusenciasPorAgente } from "../../../core/documentos/reportes/ausenciasPorAgente";
import { DocumentoLicenciasPorAgente } from "../../../core/documentos/reportes/licenciasPorAgente";


import { DocumentoConstanciaCertificado } from '../../../core/documentos/constanciaCertificado';
import { DocumentoCredencialAgente } from '../../../core/documentos/credencialAgente';
import { DocumentoParteDiarioAgente } from '../../../core/documentos/partes/parteDiario';

class ReportesController extends BaseDocumentoController {

    constructor(){
        super();
        // Reports
        this.getLegajoAgente = this.getLegajoAgente.bind(this);
        this.downloadLegajoAgente = this.downloadLegajoAgente.bind(this);
        this.getAusenciasPorAgente = this.getAusenciasPorAgente.bind(this);
        this.downloadAusenciasPorAgente = this.downloadAusenciasPorAgente.bind(this);
        this.getCredencial = this.getCredencial.bind(this);
        this.downloadCredencial = this.downloadCredencial.bind(this);
        this.getCertificado = this.getCertificado.bind(this);
        this.downloadCertificado = this.downloadCertificado.bind(this);
        this.getPartes = this.getPartes.bind(this);
        this.downloadPartes = this.downloadPartes.bind(this);
    }


    async downloadLegajoAgente(req, res, next, options = null) {        
        let doc = new DocumentoLegajoAgente();
        return await this.downloadDocumentoPDF(req, res, next, doc, options);
    }


    /**
     * PDF
     * @param req 
     * @param res 
     * @param next 
     * @param options 
     */
     async  downloadListadoAgente(req, res, next, options = null) {
        let doc = new DocumentoListadoAgentes();
        return await this.downloadDocumentoPDF(req, res, next, doc, options);
    }


     async  downloadTotalesPorArticulo(req, res, next, options = null) {
        let doc = new DocumentoAusenciasTotalesPorArticulo();
        return await this.downloadDocumentoPDF(req, res, next, doc, options);
    }


     async  downloadAusenciasPorAgente(req, res, next, options = null) {
        let doc = new DocumentoAusenciasPorAgente();
        return await this.downloadDocumentoPDF(req, res, next, doc, options);
    }


     async  downloadLicenciasPorAgente(req, res, next, options = null) {
        let doc = new DocumentoLicenciasPorAgente();
        return await this.downloadDocumentoPDF(req, res, next, doc, options);
    }


    /**
     * PDF
     * @param req 
     * @param res 
     * @param next 
     * @param options 
     */
     async  getLegajoAgente(req, res, next) {
        let doc = new DocumentoLegajoAgente();
        return await this.getDocumentoHTML(req, res, next, doc);
    }


    /**
     * HTML
     * @param req 
     * @param res 
     * @param next 
     * @param options 
     */
     async  getListadoAgente(req, res, next) {
        let doc = new DocumentoListadoAgentes();
        return await this.getDocumentoHTML(req, res, next, doc);
    }

     async  getTotalesPorArticulo(req, res, next) {
        let doc = new DocumentoAusenciasTotalesPorArticulo();
        return await this.getDocumentoHTML(req, res, next, doc);
    }

     async  getAusenciasPorAgente(req, res, next) {
        let doc = new DocumentoAusenciasPorAgente();
        return await this.getDocumentoHTML(req, res, next, doc);
    }

    async  getLicenciasPorAgente(req, res, next) {
        let doc = new DocumentoLicenciasPorAgente();
        return await this.getDocumentoHTML(req, res, next, doc);
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
            let doc = new DocumentoParteDiarioAgente();
            return await this.getDocumentoHTML(req, res, next, doc);
        }
        catch(err){
            return next(err);
        }    
    }

    async downloadPartes(req, res, next, options = null) {
        try {
            let doc = new DocumentoParteDiarioAgente();
            return await this.downloadDocumentoPDF(req, res, next, doc);
        }
        catch(err){
            return next(err);
        }
    }
}

export default ReportesController;




// /**
//  * PDF
//  * @param req 
//  * @param res 
//  * @param next 
//  * @param options 
//  */
// export async function downloadLegajoAgente(req, res, next, options = null) {
//     let doc = new DocumentoLegajoAgente();
//     return await this.downloadDocumentoPDF(req, res, next, doc, options);
// }


// /**
//  * PDF
//  * @param req 
//  * @param res 
//  * @param next 
//  * @param options 
//  */
// export async function downloadListadoAgente(req, res, next, options = null) {
//     let doc = new DocumentoListadoAgentes();
//     return await this.downloadDocumentoPDF(req, res, next, doc, options);
// }


// export async function downloadTotalesPorArticulo(req, res, next, options = null) {
//     let doc = new DocumentoAusenciasTotalesPorArticulo();
//     return await this.downloadDocumentoPDF(req, res, next, doc, options);
// }


// export async function downloadAusenciasPorAgente(req, res, next, options = null) {
//     let doc = new DocumentoAusenciasPorAgente();
//     return await this.downloadDocumentoPDF(req, res, next, doc, options);
// }


// export async function downloadLicenciasPorAgente(req, res, next, options = null) {
//     let doc = new DocumentoLicenciasPorAgente();
//     return await this.downloadDocumentoPDF(req, res, next, doc, options);
// }


// /**
//  * PDF
//  * @param req 
//  * @param res 
//  * @param next 
//  * @param options 
//  */
// export async function getLegajoAgente(req, res, next) {
//     let doc = new DocumentoLegajoAgente();
//     return await this.getDocumentoHTML(req, res, next, doc);
// }


// /**
//  * HTML
//  * @param req 
//  * @param res 
//  * @param next 
//  * @param options 
//  */
// export async function getListadoAgente(req, res, next) {
//     let doc = new DocumentoListadoAgentes();
//     return await this.getDocumentoHTML(req, res, next, doc);
// }

// export async function getTotalesPorArticulo(req, res, next) {
//     let doc = new DocumentoAusenciasTotalesPorArticulo();
//     return await this.getDocumentoHTML(req, res, next, doc);
// }

// export async function getAusenciasPorAgente(req, res, next) {
//     let doc = new DocumentoAusenciasPorAgente();
//     return await this.getDocumentoHTML(req, res, next, doc);
// }

// export async function getLicenciasPorAgente(req, res, next) {
//     let doc = new DocumentoLicenciasPorAgente();
//     return await this.getDocumentoHTML(req, res, next, doc);
// }


// export async function this.getDocumentoHTML(req, res, next, doc) {
//     try {
//         let html = await doc.getHTML(req);
//         res.writeHead(200, {
//             'Content-Type': 'text/html'
//         });
//         res.write(html);
//         res.end();
//     }
//     catch(err){
//         return next(err);
//     }
// }

// export async function this.downloadDocumentoPDF(req, res, next, doc, options = null) {
//     try {
//         let file = await doc.getPDF(req);
//         res.download((file as string), (err) => {
//             if (err) {
//                 next(err);
//             } else {
//                 next();
//             }
//         });
//     }
//     catch(err){
//         return next(err);
//     }   
// }