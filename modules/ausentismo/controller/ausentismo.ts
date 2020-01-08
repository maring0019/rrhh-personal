import { AusenciaPeriodo } from '../schemas/ausenciaperiodo';

import * as utils from '../commons/utils';
import * as aus from '../commons/ausentismo';

import { Types } from 'mongoose';
import { Agente } from '../../agentes/schemas/agente';
import { IndicadorAusentismo } from '../schemas/indicador';

export async function getAusentismoById(req, res, next){
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) return next(404);
        let obj:any = await AusenciaPeriodo.findById(id);
        if (!obj) return next(404);
        return res.json(obj);
    } catch (err) {
        return next(err);
    }
}

export async function getAusentismo(req, res, next) {
    try {
        let results = [];
        let query = AusenciaPeriodo.find({});
        // Params
        const agenteId = req.query.agenteId;
        const articuloId = req.query.articuloId;
        const fechaDesde = req.query.fechaDesde;
        const fechaHasta = req.query.fechaHasta;
        let agente:any = await utils.findObjectById(agenteId, Agente);
        if (!agente){
            return res.json(results);
        }
        else{
            query.where('agente.id').equals(agenteId);
        }
        if (articuloId) {
            query.where('articulo.id').equals(articuloId);
        }
        if (fechaDesde) {
            query.where({'fechaDesde': { $gte: fechaDesde }})
        }
        if (fechaHasta) {
            query.where({'fechaHasta': { $lte: fechaHasta }})
        }
        results = await query.sort({ fechaHasta: -1 }).limit(365).exec();
        return res.json(results);
    } catch (err) {
        return next(err);
    }
}


export async function addAusentismo(req, res, next) { 
    try {
        const ausentismo = res.locals.ausentismo;
        const controller = res.locals.controller;
        let response = await controller.addAusentismo(ausentismo);
        return res.json(response);
    } catch (err) {
        return next(err);
    }
}

export async function updateAusentismo(req, res, next){
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) return res.status(404).send();
        
        let ausentismoToUpdate:any = await AusenciaPeriodo.findById(id);
        if (!ausentismoToUpdate) return res.status(404).send();
        
        let ausentismoNewValues = res.locals.ausentismo;
        let controller = res.locals.controller;
        if (!ausentismoToUpdate.articulo.id.equals(ausentismoNewValues.articulo._id))
            return res.status(400).send({ message:"No se puede editar el Articulo!" });
        
        let response = await controller.updateAusentismo(ausentismoToUpdate, ausentismoNewValues);
        return res.json(response);
        
    } catch (err) {
        return next(err);
    }
}

export async function sugerirDiasAusentismo(req, res, next) {
    try {
        
        let ausentismo = res.locals.ausentismo;
        let controller = res.locals.controller;
        let response = await controller.sugerirAusentismo(ausentismo.agente, ausentismo.articulo, ausentismo.fechaDesde);
        return res.json(response);
    } catch (err) {
        console.log(err)
        return next(err);
    }
}

export async function calcularAusentismo(req, res, next) {
    try {
        const ausentismo = await utils.parseAusentismo(req.body);
        let ausencias = await aus.calcularDiasAusencias(ausentismo.agente, ausentismo.articulo,
        ausentismo.fechaDesde, ausentismo.fechaHasta, ausentismo.cantidadDias);
    return res.json(ausencias);
    } catch (err) {
        return next(err);
    }
}



export async function getIndicadoresLicencia(req, res, next){
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) return next(404);
        let agente:any = await Agente.findById(id);
        if (!agente) return next(404);
        const thisYear = new Date().getFullYear();
        let indicadores = await IndicadorAusentismo.find(
            {
                'agente.id': new Types.ObjectId(agente._id),
                // 'articulo.id': new Types.ObjectId(articulo.id),
                'vigencia': { $gte : thisYear -3 },
                'vencido': false
            }).sort({ vigencia: 1 });
        return res.json(indicadores);
    } catch (err) {
        return next(err);
    }

}