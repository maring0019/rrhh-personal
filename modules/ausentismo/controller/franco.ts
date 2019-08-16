import { Types } from 'mongoose';

import { Franco } from '../schemas/franco';
import * as utils from '../commons/utils';


export async function getFrancos(req, res, next) {
    try {
        let query = Franco.find({});
        if (req.query.fecha) {
            const fecha = utils.parseDate(new Date(req.body.fecha));
            query.where({ fecha: fecha });
        }
        if (req.query.agenteID) {
            query.where({ 'agente.id': new Types.ObjectId(req.query.agenteID) });
        }
        let objs = await query.sort({ fecha: 1 }).exec();
        return res.json(objs);
    } catch (err) {
        return next(err);
    }
}


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

export async function addFrancos(req, res, next) {
    // TODO Filtrar elementos duplicados previamente (NO insertar dos francos el mismo dia)
    try {
        let francos = req.body;
        let newFrancos:any = [];
        if (francos && francos.length){
            francos = francos.map(
                f => f = new Franco({
                    agente: f.agente,
                    fecha: utils.parseDate(new Date(f.fecha)),
                }));
            newFrancos = await Franco.insertMany(francos);
        }
        return res.json(newFrancos);
    } catch (err) {
        return next(err);
    }
}
