import { DocumentoConstanciaCertificado } from '../../../core/documentos/constanciaCertificado';

export async function downloadCertificado(req, res, next, options = null) {
    try {
        let doc = new DocumentoConstanciaCertificado();
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

export async function getCertificado(req, res, next) {
    try {
        let doc = new DocumentoConstanciaCertificado();
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