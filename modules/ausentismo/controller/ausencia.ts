import { Types } from 'mongoose';

import { AusenciaPeriodo } from '../schemas/ausenciaPeriodo';
import { Agente } from '../../agentes/schemas/agente';

import * as utils from '../commons/utils';
import * as ind from '../commons/indicadores';


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


export async function calcularAusentismo(req, res, next) {
    try {
        const ausentismo = await utils.parseAusentismo(req.body);
    let ausencias = utils.calcularDiasAusencias(ausentismo.agente, ausentismo.articulo,
        ausentismo.fechaDesde, ausentismo.fechaHasta, ausentismo.cantidadDias);
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
            ausentismoToUpdate.ausencias = utils.generarDiasAusencia(ausentismoChanged, ausentismoValidado.ausencias);
            ausentismoToUpdate.fechaDesde = ausentismoChanged.fechaDesde;
            ausentismoToUpdate.fechaHasta = ausentismoChanged.fechaHasta;
            ausentismoToUpdate.cantidadDias = ausentismoChanged.cantidadDias;
            ausentismoToUpdate.articulo = ausentismoChanged.articulo;
            
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

export async function findObjectById(objectId, Model){
    if (!objectId || (objectId && !Types.ObjectId.isValid(objectId))) return;
    return await Model.findById(objectId);
    
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



export async function updateLicencia(req, res, next){
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) return res.status(404).send();
        
        let ausentismoToUpdate:any = await AusenciaPeriodo.findById(id);
        if (!ausentismoToUpdate) return res.status(404).send();
        
        let ausentismoNewValues = await utils.parseAusentismo(req.body);
        let ausenciasCalculadas = await editarLicencia(ausentismoToUpdate, ausentismoNewValues.agente,
            ausentismoNewValues.articulo, ausentismoNewValues.fechaDesde, ausentismoNewValues.fechaHasta, ausentismoNewValues.cantidadDias);
        
        if (!ausenciasCalculadas.warnings || !ausenciasCalculadas.warnings.length){
            const ausentismoUpdated = await saveLicenciaUpdated(ausentismoToUpdate, ausentismoNewValues, ausenciasCalculadas)
            await ind.deleteIndicadoresHistoricos(ausentismoToUpdate);
            await ind.saveIndicadoresHistoricos(ausentismoToUpdate, ausenciasCalculadas.indicadores);
            await ind.saveIndicadores(ausenciasCalculadas.indicadores);
            return res.json(ausentismoUpdated);
        }
        else{
            // Return ausencias con warnings. No guardamos nada
            return res.json(ausenciasCalculadas);    
        }
    } catch (err) {
        return next(err);
    }
}

async function saveLicenciaUpdated(ausentismoToUpdate, ausentismoNewValues, ausenciasCalculadas){
    ausentismoToUpdate.ausencias = utils.generarDiasAusencia(ausentismoNewValues, ausenciasCalculadas.ausencias);
    ausentismoToUpdate.fechaDesde = ausentismoNewValues.fechaDesde;
    ausentismoToUpdate.fechaHasta = ausentismoNewValues.fechaHasta;
    ausentismoToUpdate.cantidadDias = ausentismoNewValues.cantidadDias;
    ausentismoToUpdate.articulo = ausentismoNewValues.articulo;
        
    const ausentismoUpdated = await ausentismoToUpdate.save();
    return ausentismoUpdated
}

export async function editarLicencia(ausEnEdicion, agente, articulo, desde, hasta, dias){
    let ausencias:any;
    if(ausEnEdicion.articulo.id == articulo.id){
        ausencias = editarLicenciaArticuloActual(ausEnEdicion, agente, articulo, desde, hasta, dias)
    }
    else{
        ausencias = editarAusentismoArticuloNuevo(ausEnEdicion, agente, articulo, desde, hasta, dias)
    }
    return ausencias;
}


export async function editarLicenciaArticuloActual(licEnEdicion, agente, articulo, desde, hasta, dias){
    let ausencias = utils.calcularDiasAusencias(agente, articulo, desde, hasta, dias);
    
    let indicadoresActuales = await ind.getIndicadoresLicencia(agente, articulo, ausencias.desde, ausencias.hasta);
    let indicadoresHistoricos = await ind.getIndicadoresLicenciaHistoricos(licEnEdicion);
    let indicadoresCorregidos = ind.mergeIndicadores(indicadoresActuales, indicadoresHistoricos);
    let indicadoresRecalculados = await utils.distribuirLicenciasEntreIndicadores(agente, articulo, indicadoresCorregidos, ausencias);  

    let warnings = [];
    warnings = warnings.concat(utils.formatWarningsIndicadores(await utils.checkIndicadoresGuardado(indicadoresRecalculados)));
    warnings = warnings.concat(utils.formatWarningsSuperposicion(await utils.checkSolapamientoPeriodos(agente, articulo, ausencias.desde, ausencias.hasta, licEnEdicion)));
    
    ausencias.warnings = warnings;
    ausencias.indicadores = indicadoresRecalculados;
    return ausencias;
}