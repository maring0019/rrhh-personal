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
            query.where({ 'agente._id': new Types.ObjectId(req.query.agenteID) });
        }
        let objs = await query.sort({ fecha: 1 }).exec();
        return res.json(objs);
    } catch (err) {
        return next(err);
    }
}

export async function getAsEvento(req, res, next) {
    try {
        let matchAgente:any = {};
        if (req.query.agenteID) {
            matchAgente = { 'agente._id': Types.ObjectId(req.query.agenteID)};
        }
        // TODO: Aplicar algun filtro por anio o similar. Ahora por defecto
        // recupera la info en un periodo de un anio hacia atras y adelante
        const thisYear = (new Date()).getFullYear();
        const fechaHasta = new Date((thisYear + 1) + "-12-31");
        const fechaDesde = new Date((thisYear - 1) + "-01-01") ;
        let matchFecha:any = { fecha: { $gte:fechaDesde, $lte:fechaHasta }};
        const pipeline = [
            { $match: 
                { ...matchAgente, ...matchFecha}
            },
            { $project:
                {
                    _id: "$_id",
                    title: { $ifNull: ['$descripcion', 'Franco'] },
                    start: { $dateToString: { date: "$fecha", format:"%Y-%m-%d"}},
                    allDay: { $literal: true },
                    backgroundColor: "transparent",
                    textColor: 'grey',
                    type: "Franco",
                    ausentismoFechaDesde: { $dateToString: { date: "$fecha", format:"%Y-%m-%dT00:00:00"}},
                    ausentismoFechaHasta: { $dateToString: { date: "$fecha", format:"%Y-%m-%dT00:00:00"}},
                    startString: { $dateToString: { date: "$fecha", format:"%Y-%m-%dT00:00:00"}},
                }
            }
        ];
        let objs = await Franco.aggregate(pipeline)
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



/**
 * Inserta en forma masiva un conjunto de francos recibidos por parametro en
 * el body del request.
 * Previo a insertar verificamos que no se inserten francos duplicados para
 * un mismo dia y agente
 * @param req 
 * @param res 
 * @param next 
 */
export async function addManyFrancos(req, res, next) {
    try {
        let francos = req.body;
        let newFrancos:any = [];
        if (francos && francos.length){
            francos = francos.map(
                f => f = new Franco({
                    agente: f.agente,
                    fecha: utils.parseDate(new Date(f.fecha)),
                }));
            const weekend = francos.map(f=>f.fecha);
            const agente = francos[0].agente;
            const francosExistentes = await Franco.find(
                {
                    'agente._id': Types.ObjectId(agente._id), 
                    'fecha': { $in: weekend }
                }).lean();
            
            francos = francos.filter(x => !francosExistentes.filter( y => y.fecha.getTime() === x.fecha.getTime()).length);
            newFrancos = await Franco.insertMany(francos);
        }
        return res.json(newFrancos);
    } catch (err) {
        return next(err);
    }
}


/**
 * Elimina en forma masiva un conjunto de francos. Los ids de los francos 
 * eliminar se reciben por parametro en el body del request.
 * @param req 
 * @param res 
 * @param next 
 */
export async function deleteManyFrancos(req, res, next) {
    try {
        const ids = req.body;
        let francosIds = ids.map(id=>Types.ObjectId(id))
        await Franco.deleteMany({ _id: { $in : francosIds } });
        return res.status(200).send();
    } catch (err) {
        return next(err);
    }
}


export async function deleteFranco(req, res, next) {
    try {
        const id = req.params.id;
        let franco:any = await Franco.findById(id);
        if (!franco) return res.status(404).send({message:"Not found"});
        const objRemoved = await franco.remove();
        return res.json(objRemoved);
    } catch (err) {
        return next(err);
    }
}
