import BaseController from '../../../core/app/basecontroller';

import * as fs from 'fs';
import * as path from 'path';
import * as ejs from 'ejs';
import config from '../../../confg';

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
        "nota"           : "Nota",
        "parte"          : "Parte"
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
                const template = fs.readFileSync(path.join(config.app.templateRootPath, 'audit/diff.ejs'), 'utf8');
                const diffContent = history.htmlDiff;
                const html = ejs.render(template, {diff:diffContent});
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
