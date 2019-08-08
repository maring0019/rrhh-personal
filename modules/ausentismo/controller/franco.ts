import { Franco } from '../schemas/franco';
import * as utils from '../commons/utils';

export async function addFranco(req, res, next) {
    try {
        const obj = new Franco({
            agente: req.body.agente,
            fecha: req.body.fecha? utils.parseDate(new Date(req.body.fecha)):null,
        });
        const objNuevo = await obj.save();
        return res.json(objNuevo);
    } catch (err) {
        return next(err);
    }
}
