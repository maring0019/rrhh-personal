import { Types } from 'mongoose';

import { Ausencia } from '../schemas/ausencia';
import { AusenciaPeriodo } from '../schemas/ausenciaPeriodo';
// import { Agente } from '../../agentes/schemas/agente';

import { attachFilesToObject } from '../../../core/files/controller/file';

export async function getAusenciaById(req, res, next) {
    try {
        let obj = await Ausencia.findById(req.params.id);
        return res.json(obj);
    } catch (err) {
        return next(err);
    }
}


export async function addAusencia(req, res, next) {
    try {
        const obj = new Ausencia({
            agente: req.body.agente, 
            fecha: req.body.fecha,
            articulo: req.body.articulo,
            observacion: req.body.observacion,
            adicional: req.body.adicional,
            extra: req.body.extra,
            adjuntos: req.body.adjuntos,
            certificado: req.body.certificado
        });
        const objNuevo = await obj.save();
        return res.json(objNuevo);
    } catch (err) {
        return next(err);
    }
}

export async function getAusenciasPeriodo(req, res, next) {
    try {
        let results = [];
        let query = AusenciaPeriodo.find({});
        // Params
        // const agenteId = req.query.agenteId;
        // const articuloId = req.query.articuloId;
        // const fechaDesde = req.query.fechaDesde;
        // const fechaHasta = req.query.fechaHasta;

        // let agente:any = await findObjectById(agenteId, Agente);
        // if (!agente){
        //     return res.json(results);
        // }
        // else{
        //     query.where('agente.id').equals(agenteId);
        // }
        // if (articuloId) {
        //     query.where('articulo.id').equals(articuloId);
        // }
        // if (fechaDesde) {
        //     query.where({'fechaDesde': { $gte: fechaDesde }})
        // }
        // if (fechaHasta) {
        //     query.where({'fechaHasta': { $lte: fechaHasta }})
        // }
        results = await query.sort({ fechaHasta: 1 }).exec();
        return res.json(results);
    } catch (err) {
        return next(err);
    }
}

export async function findObjectById(objectId, Model){
    if (!objectId || (objectId && !Types.ObjectId.isValid(objectId))) return;
    return await Model.findById(objectId);
    
}


export async function addAusenciasPeriodo(req, res, next) {
    try {
        let adjuntos = req.body.adjuntos;
        const periodo = {
                agente: req.body.agente, 
                articulo: req.body.articulo,
                fechaDesde: req.body.fechaDesde,
                fechaHasta: req.body.fechaHasta,
                cantidadDias: req.body.cantidadDias,
                observacion: req.body.observacion,
                adicional: req.body.adicional,
                extra: req.body.extra,
                certificado: req.body.certificado,
                ausencias: []
            };
        periodo.ausencias = generarAusencias(periodo);
        const obj = new AusenciaPeriodo(periodo);
        const objNuevo = await obj.save();
        if (objNuevo && adjuntos && adjuntos.length){
            await attachFilesToObject(adjuntos, periodo);
        }
        return res.json(objNuevo);
    } catch (err) {
        return next(err);
    }
}

export async function calcularAusencias(req, res, next){

}

export function generarAusencias(periodo){
    let ausencias = [];
    let fecha:Date = periodo.fechaDesde;
    for (let i = 0; i < periodo.cantidadDias ; i++) {
        const ausencia = new Ausencia({
            agente: periodo.agente, 
            fecha: fecha,
            articulo: periodo.articulo
            }
        )
        ausencias.push(ausencia);
        let tomorrow = new Date(fecha);
        fecha = new Date(tomorrow.setDate(tomorrow.getDate() + 1));
        }
    return ausencias;
}


export async function validateAusencias(ausenciaPeriodo) {
    return true;
}


