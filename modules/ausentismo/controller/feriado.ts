import { Feriado } from '../schemas/feriado';
import * as utils from '../commons/utils';

export async function getFeriadoById(req, res, next) {
    try {
        let obj = await Feriado.findById(req.params.id);
        return res.json(obj);
    } catch (err) {
        return next(err);
    }
}

export async function getFeriados(req, res, next) {
    try {
        let query = Feriado.find({});
        if (req.query.fecha) {
            const fecha = utils.parseDate(new Date(req.body.fecha));
            query.where({ fecha: fecha });
        }
        let objs = await query.sort({ fecha: 1 }).exec();
        return res.json(objs);
    } catch (err) {
        return next(err);
    }
}


export async function addFeriado(req, res, next) {
    try {
        const obj = new Feriado({
            fecha: req.body.fecha? utils.parseDate(new Date(req.body.fecha)):null,
        });
        const objNuevo = await obj.save();
        return res.json(objNuevo);
    } catch (err) {
        return next(err);
    }
}
