import { DocumentoLegajoAgente } from "../../../core/documentos/reportes/legajoAgentes";
import { DocumentoListadoAgentes } from "../../../core/documentos/reportes/listadoAgentes";


export async function legajoAgente(req, res, next){

}

export async function downloadLegajoAgente(req, res, next, options = null) {
    try {
        let doc = new DocumentoLegajoAgente();
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

export async function getLegajoAgente(req, res, next) {
    try {
        let doc = new DocumentoLegajoAgente();
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


export async function getListadoAgente(req, res, next) {
    try {
        let doc = new DocumentoListadoAgentes();
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


export async function downloadListadoAgente(req, res, next, options = null) {
    try {
        let doc = new DocumentoListadoAgentes();
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