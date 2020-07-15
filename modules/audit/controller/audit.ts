import BaseController from '../../../core/app/basecontroller';

const diffHistory = require("../../../packages/mongoose-audit-trail");
const expandableFields = ["codigo", "nombre", "color"];

class AuditController extends BaseController {


    constructor(model) {
        super(model);
        this.getHtmlDiff = this.getHtmlDiff.bind(this);
    }

    models = {
        "articulo"       : "Articulo",
        "feriado"        : "Feriado",
        "tipo-situacion" : "TipoSituacion",
        "guardia-lote"   : "GuardiaLote",
        "agente"         : "Agente",
        "nota"           : "Nota"
    }

    async get(req, res, next) {
        const params = this.getQueryParams(req);
        const modelName = params['filter'].model;
        const id = params['filter'].id;
        
        diffHistory
            .getHistories(this.models[modelName], id, expandableFields)
            .then(histories => {
                return res.json(histories)
            })
            .catch(err => {return next(err)});
    }

    async getHtmlDiff(req, res, next) {
        diffHistory
            .getHistory(req.params.id)
            .then( history => {
                let html = history.htmlDiff;
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.write(html);
                res.end();
            })
            .catch(err => {return next(err)});
    }
}

export default AuditController; 
