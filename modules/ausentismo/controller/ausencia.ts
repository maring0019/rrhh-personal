import { Types } from 'mongoose';

import { Ausencia } from '../schemas/ausencia';
import { AusenciaPeriodo } from '../schemas/ausenciaPeriodo';
import { Agente } from '../../agentes/schemas/agente';

// import { attachFilesToObject } from '../../../core/files/controller/file';
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
        // let adjuntos = req.body.adjuntos;
        const ausentismo = {
                agente: req.body.agente, 
                articulo: req.body.articulo,
                fechaDesde: req.body.fechaDesde? new Date(req.body.fechaDesde):null,
                fechaHasta: req.body.fechaHasta? new Date(req.body.fechaHasta):null,
                cantidadDias: req.body.cantidadDias,
                observacion: req.body.observacion,
                adicional: req.body.adicional,
                extra: req.body.extra,
                certificado: req.body.certificado,
                ausencias: []
            };
        console.log('Vamos a calcular las ausencias!!!');
        let ausencias = await calcularAusencias(
            ausentismo.agente, ausentismo.articulo, ausentismo.fechaDesde,
            ausentismo.fechaHasta, ausentismo.cantidadDias);
        console.log('Ausencias calculadas. El resultado es:')
        console.log(ausencias);
        // periodo.ausencias = generarAusencias(periodo);
        // const obj = new AusenciaPeriodo(periodo);
        // const objNuevo = await obj.save();
        // if (objNuevo && adjuntos && adjuntos.length){
        //     await attachFilesToObject(adjuntos, objNuevo._id);
        // }
        // return res.json(objNuevo);
        return res.json(ausencias);
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

export async function calcularAusencias(agente, articulo, desde, hasta, dias){
    desde = desde? new Date(desde.getFullYear(), desde.getMonth(), desde.getDate()):null;
    hasta = hasta? new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate()):null;
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

    console.log('Recuperando Indicadores');
    let indicadores = recuperarIndicadoresAusentismo(agente, articulo, desde, hasta);
    console.log(indicadores);

    return ausencias;
    
    // indicadores.forEach(indicador => {
    //     distribuirAusenciasEntreIndicadores(indicador, ausencias)
    // });
    // if (formula.controlaPeriodo){

    // }
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

export async function recuperarIndicadoresAusentismo(agente, articulo, desde, hasta){
    const anioDesde = desde.getFullYear();
    const anioHasta = hasta.getFullYear();
    let anios = [anioDesde];
    let indicadores = [];
    if (anioDesde != anioHasta) anios.push(anioHasta);
    // anios.forEach(anio => {
    // });
    let anio = anioDesde; // TODO resolver ciclo anios con await 
    let indicador = await IndicadorAusentismo.findOne(
        {
            'agente.id': new Types.ObjectId(agente.id),
            'articulo.id': new Types.ObjectId(articulo.id),
            'vigencia':anio
        });
    if (!indicador){
        indicador = await crearIndicadoresAusentismo(agente, articulo, anio);
    }
    indicadores.push(indicador);
    return indicadores;
}

export async function crearIndicadoresAusentismo(agente, articulo, anio){
    console.log('Vamos a crear un indicador');
    let indicador:any= {
        agente: agente,
        articulo: articulo,
        vigencia: anio,
        indicadores:[]
    }
    let indicadores = indicador.indicadores;
    articulo.formulas.forEach(formula => {
        let indicador = {
            periodo: formula.periodo.nombre,
            intervalos: []
        }
        let periodoConfiguracion = constantes[formula.periodo.nombre];
        periodoConfiguracion.intervalos.forEach(async int => {
            let desde = int.desde? new Date(anio, int.desde.mes, int.desde.dia) : null;
            let hasta = int.hasta? new Date(anio, int.hasta.mes, int.hasta.dia) : null;
            let totales = formula.limiteAusencias;
            let ejecutadas = await getTotalAusenciasPorArticulo(agente, articulo, desde, hasta);
            let disponibles = totales - ejecutadas;
            
            let intervalo = {
                desde: desde,
                hasta: hasta,
                totales: totales,
                ejecutadas: ejecutadas,
                disponibles: disponibles
            }
            indicador.intervalos.push(intervalo)
        });
        indicadores.push(indicador);
    });
    console.log('Indicador creado!!');
    // console.log(indicador);
    indicador.indicadores.forEach(element => {
        console.log(element.periodo);
        console.log(element.intervalos);
        
    });
    return indicador;
}

export function procesaDiasCorridos(desde:Date, hasta?:Date, dias?:number){
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
    if (dias){ // Si tiene fecha hasta igualmente toma precedencia la cantidad de dias
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

export function procesaDiasHabiles(desde:Date, hasta?:Date, dias?){
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
    if (dias){ // Si tiene fecha hasta igualmente toma precedencia la cantidad de dias
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
    let esDiaHabil = true;
    let finDeSemanas = [new Date(2019,6,20), new Date(2019,6,21), new Date(2019,6,27), new Date(2019,6,28)];
    let feriados = [new Date(2019,6,18), new Date(2019,6,23)]
    for (let finde of finDeSemanas){
        if (date.getTime() === finde.getTime()) {
            esDiaHabil = false;
            break;
        }
    }
    if (esDiaHabil){
        for (let feriado of feriados){
            if (date.getTime() === feriado.getTime()) {
                esDiaHabil = false;
                break;
            };
        }
    }
    return esDiaHabil;
}

export async function getTotalAusenciasPorArticulo(agente, articulo, desde, hasta){
    console.log('Falta implementar getTotalAusenciasPorArticulo')
    let query = AusenciaPeriodo.find({});
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
        // results = await query.sort({ fechaHasta: 1 }).exec();

        const pipeline = [
            { $match: { 'agente.id': agente.id, 'articulo.id': articulo.id } },
            {
                $unwind: '$ausencias'
            }
        ]
        let ausencias = await AusenciaPeriodo.aggregate(pipeline)
    return 12;
}

export const constantes = {
    PERIODO_ANUAL: {
        intervalos: [{desde: {dia:1, mes:0}, hasta:{dia:31, mes:11 }, limiteAusencias:74 }]
    },
    PERIODO_CUATRIMESTRE: {
        intervalos: [
            {desde:{dia:1, mes:0}, hasta:{dia:30, mes:3}},
            {desde:{dia:1, mes:4}, hasta:{dia:31, mes:7}},
            {desde:{dia:1, mes:8}, hasta:{dia:31, mes:11}}]
    },
    PERIODO_MENSUAL: {
        intervalos: [
            {desde:{dia:1, mes:0}, hasta:{dia:31, mes:0}},
            {desde:{dia:1, mes:1}, hasta:{dia:28, mes:1}},
            {desde:{dia:1, mes:2}, hasta:{dia:31, mes:2}},
            {desde:{dia:1, mes:3}, hasta:{dia:30, mes:3}},
            {desde:{dia:1, mes:4}, hasta:{dia:31, mes:4}},
            {desde:{dia:1, mes:5}, hasta:{dia:30, mes:5}},
            {desde:{dia:1, mes:6}, hasta:{dia:31, mes:6}},
            {desde:{dia:1, mes:7}, hasta:{dia:31, mes:7}},
            {desde:{dia:1, mes:8}, hasta:{dia:30, mes:8}},
            {desde:{dia:1, mes:9}, hasta:{dia:31, mes:9}},
            {desde:{dia:1, mes:10}, hasta:{dia:30, mes:10}},
            {desde:{dia:1, mes:11}, hasta:{dia:31, mes:11}}]
    }
}


export function removeAusencias(ausentismo){

}


export async function validateAusencias(ausenciaPeriodo) {
    return true;
}


