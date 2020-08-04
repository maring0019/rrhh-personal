class BaseDocumentoController {
    
    constructor() {
        this.getDocumentoHTML = this.getDocumentoHTML.bind(this);
        this.downloadDocumentoPDF = this.downloadDocumentoPDF.bind(this);
     }
    
    async getDocumentoHTML(req, res, next, doc) {
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
    
    async downloadDocumentoPDF(req, res, next, doc, options = null) {
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
}

export default BaseDocumentoController;