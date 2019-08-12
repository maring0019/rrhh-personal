import { DocumentoConstanciaCertificado } from '../../../core/documentos/constanciaCertificado';

export async function downloadCertificado(req, res, next, options = null) {
    try {
        let doc = new DocumentoConstanciaCertificado();
        let file = await doc.generarPDF(req);
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