import * as express from 'express';


const Audit = require("../../../packages/mongoose-audit-trail/auditModel").model;
import AuditController from '../controller/audit';

const controller = new AuditController(Audit); 

export const Routes = express.Router();

Routes.get('/', controller.get);
Routes.get('/diff/:id', controller.getHtmlDiff);

