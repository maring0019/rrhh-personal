import { Feriado } from '../schemas/feriado';
import * as utils from '../commons/utils';

import BaseController from '../../../core/app/basecontroller';

class FeriadoController extends BaseController {

    async add(req, res, next) {
        try {
            const obj = new Feriado({
                fecha: req.body.fecha? utils.parseDate(new Date(req.body.fecha)):null,
                descripcion: req.body.descripcion
            });
            const objNuevo = await obj.save();
            return res.json(objNuevo);
        } catch (err) {
            return next(err);
        }
    }
}

export default FeriadoController; 