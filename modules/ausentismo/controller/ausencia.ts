import { Types } from 'mongoose';

import { Ausencia } from '../schemas/ausencia';
import { AusenciaPeriodo } from '../schemas/ausenciaPeriodo';
import { Agente } from '../../agentes/schemas/agente';

import { attachFilesToObject } from '../../../core/files/controller/file';
import { IndicadorAusentismo } from '../schemas/indicador';


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
        results = await query.sort({ fechaHasta: 1 }).exec();
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


export async function addAusentismo(req, res, next) {
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
            await attachFilesToObject(adjuntos, objNuevo._id);
        }
        return res.json(objNuevo);
    } catch (err) {
        return next(err);
    }
}

export async function updateAusentismo(req, res, next){
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) return res.status(404).send();
        let ausentismo:any = await AusenciaPeriodo.findById(id);
        if (!ausentismo) return res.status(404).send();
        ausentismo.articulo= req.body.articulo,
        ausentismo.fechaDesde= req.body.fechaDesde,
        ausentismo.fechaHasta= req.body.fechaHasta,
        ausentismo.cantidadDias= req.body.cantidadDias,
        ausentismo.observacion= req.body.observacion,
        ausentismo.adicional= req.body.adicional,
        ausentismo.extra= req.body.extra,
        ausentismo.certificado= req.body.certificado,
        ausentismo.ausencias = generarAusencias(ausentismo);
        const ausentismoUpdated = await ausentismo.save();
        return res.json(ausentismoUpdated);
    } catch (err) {
        return next(err);
    }
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

export async function calcularAusencias(ausentismo){
    let desde = ausentismo.fechaDesde;
    let hasta = ausentismo.fechaHasta;
    let dias = ausentismo.cantidadDias;
    let agente = ausentismo.agente;
    let articulo = ausentismo.articulo; // Quizas realizar un findById
    let formula = ausentismo.articulo.formula;
    let ausencias:any;

    // TODO controlar que esten presente los inputs necesarios
    // por ejemplo fecha desde debe estar presente
    // fecha desde debe ser menor o igual que fecha hasta

    if (articulo.diasCorridos){
        ausencias = procesaDiasCorridos(desde, hasta, dias);
    }

    if (articulo.diasHabiles){
        ausencias = procesaDiasHabiles(desde, hasta, dias);
    }

    let indicadores = recuperarIndicadoresAusentismo(agente, articulo, desde, hasta);
    
    indicadores.forEach(indicador => {
        distribuirAusenciasEntreIndicadores(indicador, ausencias)
    });
    if (formula.controlaPeriodo){

    }
}


export function procesaPeriodo(){

}

export function distribuirAusenciasEntreIndicadores(indicadores, ausentismo){
    ausentismo = {
        desde: ausentismo.desde,
        hasta: ausentismo.hasta,
        dias: ausentismo.dias,
        ausencias: ausentismo.ausencias // array of dias
    }
    let slots = [];
    for( let indicador of indicadores ) {
        slots.concat(filterPeriodos(indicador.periodos, ausentismo.desde, ausentismo.hasta));
    }

    for (let slot of slots){
        slot.asignados = 0; // Inicializamos en 0 el contador
        if ( slot.desde <= ausentismo.desde && slot.hasta >= ausentismo.hasta){
            slot.asignados = ausentismo.ausencias.length;
        }
        else{
            for (let dia of ausentismo.ausencias){
                if ( slot.desde <= dia && slot.hasta >= dia){
                    slot.asignados = slot.asignados + 1;
                }
                if (slot.hasta < dia) break;
            }
        }
    }
    // Aca estan los slots listos para analizar los topes
    // Posiblemente falte un dato. El fucking periodo al que pertences el slot
    // para indicarlo en el warning, no?
    return slots;
}

export function filterPeriodos(periodos, desde, hasta){
    let filterIndicadores = [];
    for( let p of periodos ) {
        if (!p.periodo){
            // Caso especial. Disponibilidad de ausencias para toda la vida laboral
        }
        else{
            let cotaInferior = false;
            for( let slot of p.slots ) {
                if ( !cotaInferior){
                    if (slot.hasta >= desde) {
                        filterIndicadores.push(slot);
                        cotaInferior = true;
                    }
                }
                else{
                    if (slot.desde > hasta) break;
                    filterIndicadores.push(slot);
                }
             }
        }
    };
    //TODO Incluir el periodo!!!!! 
    return filterIndicadores;
}

export function recuperarIndicadoresAusentismo(agente, articulo, desde, hasta){
    const anioDesde = desde.getFullYear();
    const anioHasta = hasta.getFullYear();
    let anios = [anioDesde];
    let indicadores = [];
    if (anioDesde != anioHasta) anios.push(anioHasta);
    anios.forEach(anio => {
        let indicador = IndicadorAusentismo.findOne(
            {
                'agente._id': new Types.ObjectId(agente._id),
                'articulo._id': new Types.ObjectId(articulo._id),
                'vigencia':anio
            });
        if (!indicador){
            indicador = crearIndicadoresAusentismo(agente, articulo, anio);
        }
        indicadores.push(indicador);
    });
    return indicadores;
}

export function crearIndicadoresAusentismo(agente, articulo, anio){
    let indicador:any= {
        agente: agente,
        articulo: articulo,
        vigencia: anio,
        indicadores:[]
    }
    let indicadores = indicador.indicadores;
    articulo.formulas.forEach(formula => {
        let indicador = {
            periodo: formula.periodo,
            intervalos: []
        }
        let periodoConfiguracion =  constantes[formula.periodo];
        periodoConfiguracion.intervalos.forEach(e => {
            let desde = e.desde? new Date(e.desde + '/' + anio) : null;
            let hasta = e.hasta? new Date(e.hasta + '/' + anio) : null;
            let intervalo = {
                desde: desde,
                hasta: hasta,
                totales: formula.limiteAusencias,
                ejecutadas: getTotalAusenciasPorArticulo(agente, articulo, desde, hasta),
                disponibles: formula.limiteAusencias
            }
            indicador.intervalos.push(intervalo)
        });
        indicadores.push(indicador);
    });
    return indicador;
}

export function procesaDiasCorridos(desde, hasta?, dias?, forzarDias=false){
    let ausencias = [];
    if (hasta && !dias){
        dias = 0;
        let fechaAusencia = desde;
        while(fechaAusencia <= hasta){
            dias = dias + 1;
            ausencias.push(new Date(fechaAusencia));
            fechaAusencia = addOneDay(fechaAusencia);
        }
    }
    if (!hasta && dias){
        let fechaAusencia = desde;
        for (let i = 0; i < dias ; i++) {
            hasta = fechaAusencia;
            ausencias.push(new Date(fechaAusencia));
            fechaAusencia = addOneDay(fechaAusencia);    
        }
    }
    return {
        desde: desde,
        hasta: hasta,
        dias: dias,
        ausencias: ausencias 
    }
}

export function procesaDiasHabiles(desde, hasta?, dias?, forzarDias=false){
    let ausencias = [];
    if (hasta && !dias){
        dias = 0;
        let fechaAusencia = desde;
        while(fechaAusencia <= hasta){
            if (esDiaHabil(fechaAusencia)){
                dias = dias + 1;
                ausencias.push(new Date(fechaAusencia));
            }
            fechaAusencia = addOneDay(fechaAusencia);
        }
    }
    if (!hasta && dias){
        let fechaAusencia = desde;
        let i = 0;
        while (i < dias){
            while (!esDiaHabil(fechaAusencia)){
                fechaAusencia = addOneDay(fechaAusencia);    
            }        
            hasta = fechaAusencia;
            ausencias.push(new Date(fechaAusencia));
            i = i + 1;
            fechaAusencia = addOneDay(fechaAusencia);    
        }
    }
    return {
        desde: desde,
        hasta: hasta,
        dias: dias,
        ausencias: ausencias 
    }
}


export function addOneDay(fecha){
    let tomorrow = new Date(fecha);
    return new Date(tomorrow.setDate(tomorrow.getDate() + 1));
}

export function esFeriado(date){
    return false;
}

export function esDiaHabil(date){
    return true;
}

export function getTotalAusenciasPorArticulo(agente, articulo, desde, hasta){

}

export const constantes = {
    PERIODO_ANUAL: {
        slots: [{desde:'', hasta:'', limiteAusencias:74 }]
    },
    PERIODO_CUATRIMESTRE: {
        slots: [{desde:'', hasta:''},{desde:'', hasta:''},{desde:'', hasta:''}]
    }
}


export function removeAusencias(ausentismo){

}


export async function validateAusencias(ausenciaPeriodo) {
    return true;
}


