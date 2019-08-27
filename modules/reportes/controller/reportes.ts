import { DocumentoLegajoAgente } from "../../../core/documentos/reportes/legajoAgentes";
import { DocumentoListadoAgentes } from "../../../core/documentos/reportes/listadoAgentes";
import { DocumentoAusenciasTotalesPorArticulo } from "../../../core/documentos/reportes/totalesPorArticulo";


export async function downloadLegajoAgente(req, res, next, options = null) {
    let doc = new DocumentoLegajoAgente();
    return await downloadReporte(req, res, next, doc, options);
}

export async function getLegajoAgente(req, res, next) {
    let doc = new DocumentoLegajoAgente();
    return await getReporte(req, res, next, doc);
}


export async function getListadoAgente(req, res, next) {
    let doc = new DocumentoListadoAgentes();
    return await getReporte(req, res, next, doc);
}


export async function downloadListadoAgente(req, res, next, options = null) {
    let doc = new DocumentoListadoAgentes();
    return await downloadReporte(req, res, next, doc, options);
}

export async function getTotalesPorArticulo(req, res, next) {
    let doc = new DocumentoAusenciasTotalesPorArticulo();
    return await getReporte(req, res, next, doc);
}


export async function getReporte(req, res, next, doc) {
    try {
        let html = await doc.getHTML(req);
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.write(html);
        res.end();
    }
    catch(err){
        return next(err);
    }
}

export async function downloadReporte(req, res, next, doc, options = null) {
    try {
        let file = await doc.getPDF(req);
        res.download((file as string), (err) => {
            if (err) {
                next(err);
            } else {
                next();
            }
        });
    }
    catch(err){
        return next(err);
    }   
}