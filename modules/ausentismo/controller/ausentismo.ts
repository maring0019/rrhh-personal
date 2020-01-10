import { AusenciaPeriodo } from '../schemas/ausenciaperiodo';

import * as utils from '../commons/utils';

import { Types } from 'mongoose';
import { Agente } from '../../agentes/schemas/agente';
import { IndicadorAusentismo } from '../schemas/indicador';
import { Ausencia } from '../schemas/ausencia';

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
        
        let response = "";
        if (utils.isSameDay(ausentismoToUpdate.fechaDesde, ausentismoNewValues.fechaDesde) &&
            utils.isSameDay(ausentismoToUpdate.fechaHasta, ausentismoNewValues.fechaHasta)){
            // Las fechas se mantienen igual por lo que aplicamos una simple actualizacion
            response = await controller.simpleUpdateAusentismo(ausentismoToUpdate, ausentismoNewValues);
        }
        else{
            // Las fechas se modificaron. Debemos aplicar una actualizacion completa de las
            // ausencias, indicadores, e indocadores historicos.
            response = await controller.fullUpdateAusentismo(ausentismoToUpdate, ausentismoNewValues);
        }
        return res.json(response);
        
    } catch (err) {
        return next(err);
    }
}

export async function deleteAusentismo(req, res, next){
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) return res.status(404).send();
        
        let ausentismoToDelete:any = await AusenciaPeriodo.findById(id);
        if (!ausentismoToDelete) return res.status(404).send();
        
        let controller = res.locals.controller;
        let response = await controller.deleteAusentismo(ausentismoToDelete);
        return res.json(response);  
    } catch (err) {
        return next(err);
    }
}



export async function sugerirDiasAusentismo(req, res, next) {
    try {
        
        let ausentismo = res.locals.ausentismo;
        let controller = res.locals.controller;
        let response = await controller.sugerirAusentismo(ausentismo);
        return res.json(response);
    } catch (err) {
        console.log(err)
        return next(err);
    }
}

export async function calcularAusentismo(req, res, next) {
    try {
        const ausentismo = await utils.parseAusentismo(req.body);
        let ausencias = await calcularDiasAusencias(ausentismo.agente, ausentismo.articulo,
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



/**
 * Determina con precision la fecha desde, hasta, total de dias y las fechas
 * de los dias de ausencia, de acuerdo al tipo de dia indicado por el articulo
 * (dias corridos o habiles).
 * @param agente  
 * @param articulo Determina si se deben calcular dias corridos o habiles
 * @param desde 
 * @param hasta Opcional. Si se indica este valor se intenta determinar el total de dias
 * @param dias Opcional. Si se indica este valor se intenta determinar la fecha hasta
 * @returns [Promise<IDiasAusencia>]
 */
export async function calcularDiasAusencias(agente, articulo, desde, hasta?, dias?){
    let diasAusencias;
    if ((!articulo.diasCorridos && !articulo.diaHabiles) || articulo.diasCorridos){
        diasAusencias = calculaDiasCorridos(desde, hasta, dias);
    }

    if (articulo.diasHabiles){
        diasAusencias = await calculaDiasHabiles(agente, desde, hasta, dias);
    }
    diasAusencias.ausencias = generarAusencias(agente, articulo, diasAusencias.ausencias);
    return diasAusencias;
}


export function calculaDiasCorridos(desde:Date, hasta?:Date, dias?:number){
    let ausencias = [];
    let totalDias = 0;
    if (hasta && !dias){
        let fechaAusencia = desde;
        while(fechaAusencia <= hasta){
            totalDias = totalDias + 1;
            ausencias.push(new Date(fechaAusencia));
            fechaAusencia = utils.addOneDay(fechaAusencia);
        }
    }
    if (dias){ // Si tiene fecha hasta igualmente toma precedencia la cantidad de dias
        let fechaAusencia = desde;
        for (let i = 0; i < dias ; i++) {
            hasta = fechaAusencia;
            ausencias.push(new Date(fechaAusencia));
            fechaAusencia = utils.addOneDay(fechaAusencia);    
        }
        totalDias = dias;
    }
    return {
        fechaDesde: desde,
        fechaHasta: hasta,
        cantidadDias: totalDias,
        ausencias: ausencias
    }
}


export async function calculaDiasHabiles(agente, desde:Date, hasta?:Date, dias?)
{
    let ausencias = [];
    let totalDias = 0;
    if (hasta && !dias){
        let fechaAusencia = desde;
        while(fechaAusencia <= hasta){
            if (await utils.esDiaHabil(agente, fechaAusencia)){
                totalDias = totalDias + 1;
                ausencias.push(new Date(fechaAusencia));
            }
            fechaAusencia = utils.addOneDay(fechaAusencia);
        }
    }
    if (dias){ // Si tiene fecha hasta igualmente toma precedencia la cantidad de dias
        let fechaAusencia = desde;
        let i = 0;
        while (i < dias){
            let esDiaHabil = await utils.esDiaHabil(agente, fechaAusencia)
            while (!esDiaHabil){
                fechaAusencia = utils.addOneDay(fechaAusencia);    
                esDiaHabil = await utils.esDiaHabil(agente, fechaAusencia)
            }        
            hasta = fechaAusencia;
            ausencias.push(new Date(fechaAusencia));
            i = i + 1;
            fechaAusencia = utils.addOneDay(fechaAusencia);    
        }
        totalDias = dias;
    }
    return {
        fechaDesde: desde,
        fechaHasta: hasta,
        cantidadDias: totalDias,
        ausencias: ausencias
    }
}


export function generarAusencias(agente, articulo, diasAusencia){
    let ausencias = [];
    for (const dia of diasAusencia){
        const ausencia = new Ausencia({
            agente: agente, 
            fecha: utils.parseDate(new Date(dia)),
            articulo: articulo
            }
        )
        ausencias.push(ausencia);
    }
    return ausencias;
}
