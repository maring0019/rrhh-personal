import { Types } from 'mongoose';

import { Ausencia } from '../schemas/ausencia';
import { AusenciaPeriodo } from '../schemas/ausenciaPeriodo';
import { Agente } from '../../agentes/schemas/agente';

// import { attachFilesToObject } from '../../../core/files/controller/file';

import { Articulo } from '../schemas/articulo';

import * as utils from '../commons/utils';
import * as ind from '../commons/indicadores';


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
        const agenteId = req.query.agenteId;
        const articuloId = req.query.articuloId;
        const fechaDesde = req.query.fechaDesde;
        const fechaHasta = req.query.fechaHasta;
        console.log('AgenteID');
        console.log(agenteId);
        console.log('ArticuloID');
        console.log(articuloId);
        console.log('fechaDesde');
        console.log(fechaDesde);
        console.log('fechaHasta');
        console.log(fechaHasta)

        let agente:any = await findObjectById(agenteId, Agente);
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
        results = await query.sort({ fechaHasta: -1 }).exec();
        return res.json(results);
    } catch (err) {
        return next(err);
    }
}

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

export async function findObjectById(objectId, Model){
    if (!objectId || (objectId && !Types.ObjectId.isValid(objectId))) return;
    return await Model.findById(objectId);
    
}

export async function calcularAusentismo(req, res, next) {
    try {
        const ausentismo = {
            agente: req.body.agente,
            articulo: req.body.articulo,
            fechaDesde: req.body.fechaDesde? new Date(req.body.fechaDesde):null,
            fechaHasta: req.body.fechaHasta? new Date(req.body.fechaHasta):null,
            cantidadDias: req.body.cantidadDias
        };
    let ausencias = await calcularAusencias(
        ausentismo.agente, ausentismo.articulo, ausentismo.fechaDesde, ausentismo.fechaHasta,
        ausentismo.cantidadDias);
    return res.json(ausencias);
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
        
        let ausentismoChanged = await utils.parseAusentismo(req.body);
        let ausentismoValidado = await editarAusentismo(
            ausentismoToUpdate, ausentismoChanged.agente, ausentismoChanged.articulo, ausentismoChanged.fechaDesde,
            ausentismoChanged.fechaHasta, ausentismoChanged.cantidadDias);
        
        if (!ausentismoValidado.warnings || !ausentismoValidado.warnings.length){
            console.log('Vamos a guardar los cambios del update!!');
            console.log(ausentismoChanged)
            ausentismoToUpdate.ausencias = utils.generarDiasAusencia(ausentismoChanged, ausentismoValidado.ausencias);
            ausentismoToUpdate.fechaDesde = ausentismoChanged.fechaDesde;
            ausentismoToUpdate.fechaHasta = ausentismoChanged.fechaHasta;
            ausentismoToUpdate.cantidadDias = ausentismoChanged.cantidadDias;
            ausentismoToUpdate.articulo = ausentismoChanged.articulo;
            console.log(ausentismoToUpdate)
            const ausentismoUpdated = await ausentismoToUpdate.save();
            return res.json(ausentismoUpdated);
        }
        else{
            // Return ausencias con warnings. No guardamos nada
            return res.json(ausentismoValidado);    
        }
    } catch (err) {
        return next(err);
    }
}


export async function calcularAusencias(agente, articulo, desde, hasta, dias){
    desde = desde? utils.parseDate(desde) : null;
    hasta = hasta? utils.parseDate(hasta) : null;
    articulo = await Articulo.findById(articulo.id);// get articulo con formulasausentismo.articulo;
    let ausenciasCalculadas = utils.calcularDiasAusencias(agente, articulo, desde, hasta, dias);
    return ausenciasCalculadas;
}   


export async function editarAusentismo(ausEnEdicion, agente, articulo, desde, hasta, dias){
    let ausencias:any;
    if(ausEnEdicion.articulo.id == articulo.id){
        ausencias = editarAusentismoArticuloActual(ausEnEdicion, agente, articulo, desde, hasta, dias)
    }
    else{
        ausencias = editarAusentismoArticuloNuevo(ausEnEdicion, agente, articulo, desde, hasta, dias)
    }
    return ausencias;
}


export async function editarAusentismoArticuloActual(ausEnEdicion, agente, articulo, desde, hasta, dias){
    let ausencias = utils.calcularDiasAusencias(agente, articulo, desde, hasta, dias);
    
    let indicadores = await ind.getIndicadoresAusentismo(agente, articulo, ausencias.desde, ausencias.hasta);
    let indicadoresRecalculados = utils.distribuirAusenciasEntreIndicadores(indicadores, ausencias);
    let indicadoresHistoricos = await ind.getIndicadoresHistoricos(ausEnEdicion.agente, ausEnEdicion.articulo, ausEnEdicion.fechaDesde, ausEnEdicion.fechaHasta, ausEnEdicion.cantidadDias);
    let indicadoresFinales = ind.mergeIndicadores(indicadoresRecalculados, indicadoresHistoricos);
    
    let warnings = [];
    warnings = warnings.concat(utils.formatWarningsIndicadores(await utils.checkIndicadoresGuardado(indicadoresFinales)));
    warnings = warnings.concat(utils.formatWarningsSuperposicion(await utils.checkSolapamientoPeriodos(agente, articulo, ausencias.desde, ausencias.hasta, ausEnEdicion)));

    ausencias.warnings = warnings;
    return ausencias;
}

export async function editarAusentismoArticuloNuevo(ausEnEdicion, agente, articulo, desde, hasta, dias){
    let ausencias = utils.calcularDiasAusencias(agente, articulo, desde, hasta, dias);
    let indicadores = await ind.getIndicadoresAusentismo(agente, articulo, ausencias.desde, ausencias.hasta);
    let indicadoresRecalculados = utils.distribuirAusenciasEntreIndicadores(indicadores, ausencias);  
    
    let warnings = [];
    warnings = warnings.concat(utils.formatWarningsIndicadores(await utils.checkIndicadoresGuardado(indicadoresRecalculados)));
    warnings = warnings.concat(utils.formatWarningsSuperposicion(await utils.checkSolapamientoPeriodos(agente, articulo, ausencias.desde, ausencias.hasta, ausEnEdicion)));
    
    ausencias.warnings = warnings;
    
    return ausencias;
}

