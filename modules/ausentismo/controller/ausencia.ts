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
        // console.log('Ausencias calculadas. El resultado es:')
        // console.log(ausencias);
        return res.json(ausencias);
        // ausentismo.ausencias = generarAusencias(ausentismo);
        // const obj = new AusenciaPeriodo(ausentismo);
        // const objNuevo = await obj.save();
        // // if (objNuevo && adjuntos && adjuntos.length){
        // //     await attachFilesToObject(adjuntos, objNuevo._id);
        // // }
        // return res.json(objNuevo);
        
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
    let ausenciasCalculadas:any;

    // TODO controlar que esten presente los inputs necesarios
    // por ejemplo fecha desde debe estar presente
    // fecha desde debe ser menor o igual que fecha hasta

    if (articulo.diasCorridos){
        ausenciasCalculadas = procesaDiasCorridos(desde, hasta, dias);
    }

    if (articulo.diasHabiles){
        ausenciasCalculadas = procesaDiasHabiles(desde, hasta, dias);
    }

    let indicadores = await recuperarIndicadoresAusencias(
        agente, articulo, ausenciasCalculadas);
    
    let indicadoresRecalculados = distribuirAusenciasEntreIndicadores(
        indicadores, ausenciasCalculadas);
    
    for (let i of indicadoresRecalculados){
        for (let iprima of i.indicadores){
            console.log(iprima);
        }
        
    }
    return ausenciasCalculadas;
}


export function procesaPeriodo(){

}

export function distribuirAusenciasEntreIndicadores(indicadoresAusentismo, ausentismo){
    console.log('Vamos a distribuir las ausencias');
    console.log('Primero filtramos los indicadores a solo los de interes');
    
    for( let indicadorAusentismo of indicadoresAusentismo ) {
        let indicadoresFiltrados = [];
        for (let indicador of indicadorAusentismo.indicadores){
            let indicadorFiltrado = filterIntervalosIndicador(indicador, ausentismo.desde, ausentismo.hasta)
            indicadoresFiltrados.push(indicadorFiltrado);
        }
        // console.log('Indicadores Filtrados');
        // console.log(indicadoresFiltrados);
        indicadorAusentismo.indicadores = indicadoresFiltrados;
    }

    console.log('Luego distribuimos las ausencias que le corresponden a cada intervalo de los periodos');

    for (let indicadorAusentismo of indicadoresAusentismo){
        for (let indicador of indicadorAusentismo.indicadores){
            for (let intervalo of indicador.intervalos){
                intervalo.asignadas = 0; // Inicializamos en 0 el contador
                if ( intervalo.desde <= ausentismo.desde && intervalo.hasta >= ausentismo.hasta){
                    intervalo.asignadas = ausentismo.ausencias.length;
                }
                else{
                    for (let dia of ausentismo.ausencias){
                        if ( intervalo.desde <= dia && intervalo.hasta >= dia){
                            intervalo.asignadas = intervalo.asignadas + 1;
                        }
                        if (intervalo.hasta < dia) break;
                    }
                }
            }
           
        }     
    }
    
    return indicadoresAusentismo;
}

/**
 * Utilidad para reducir el nro de indicadores a analizar
 * @param indicador 
 * @param desde 
 * @param hasta 
 */
export function filterIntervalosIndicador(indicador, desde, hasta){
    let filteredIntervalos = [];
    if (!indicador.periodo){
        // Caso especial. Disponibilidad de ausencias para toda la vida laboral
    }
    else{
        let cotaInferior = false;
        for( let intervalo of indicador.intervalos ) {
            if ( !cotaInferior){
                if (intervalo.hasta >= desde) {
                    filteredIntervalos.push(intervalo);
                    cotaInferior = true;
                }
            }
            else{
                if (intervalo.desde > hasta) break;
                filteredIntervalos.push(intervalo);
            }
        }
    }
    indicador.intervalos = filteredIntervalos;
    return indicador;
}

export async function recuperarIndicadoresAusencias(agente, articulo, ausencias){
    const anioDesde = ausencias.desde.getFullYear();
    const anioHasta = ausencias.hasta.getFullYear();
    let anios = [anioDesde];
    let indicadores = [];
    if (anioDesde != anioHasta) anios.push(anioHasta);
    for ( let anio of anios){
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
    }
    return indicadores;
}

export async function crearIndicadoresAusentismo(agente, articulo, anio){
    let indicadorAusentismo:any= {
        agente: agente,
        articulo: articulo,
        vigencia: anio,
        indicadores:[]
    }
    for (let formula of articulo.formulas ) {
        let indicador = {
            periodo: formula.periodo.nombre,
            intervalos: []
        }
        indicador.intervalos = await calcularIndicadoresPorIntervaloPeriodo(formula, agente, articulo, anio);
        indicadorAusentismo.indicadores.push(indicador);
    };
    return indicadorAusentismo;
}

export async function calcularIndicadoresPorIntervaloPeriodo(formula, agente, articulo, anio){
    let intervalos = [];
    let periodoConfiguracion = constantes[formula.periodo.nombre];
    for ( let int of periodoConfiguracion.intervalos){
        let desde = int.desde? new Date(anio, int.desde.mes, int.desde.dia) : null;
        let hasta = int.hasta? new Date(anio, int.hasta.mes, int.hasta.dia) : null;
        let totales = formula.limiteAusencias;
        let ejecutadas = await getTotalAusenciasPorArticulo(agente, articulo, desde, hasta);
        let disponibles = totales - ejecutadas;     
        let indicadoresIntervalo = {
            desde: desde,
            hasta: hasta,
            totales: totales,
            ejecutadas: ejecutadas,
            disponibles: disponibles
        }
        intervalos.push(indicadoresIntervalo)
    };
    return intervalos;
}

export function procesaDiasCorridos(desde:Date, hasta?:Date, dias?:number){
    let ausencias = [];
    let totalDias = 0;
    if (hasta && !dias){
        let fechaAusencia = desde;
        while(fechaAusencia <= hasta){
            totalDias = totalDias + 1;
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
        totalDias = dias;
    }
    return {
        desde: desde,
        hasta: hasta,
        dias: totalDias,
        ausencias: ausencias 
    }
}

export function procesaDiasHabiles(desde:Date, hasta?:Date, dias?){
    let ausencias = [];
    let totalDias = 0;
    if (hasta && !dias){
        let fechaAusencia = desde;
        while(fechaAusencia <= hasta){
            if (esDiaHabil(fechaAusencia)){
                totalDias = totalDias + 1;
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
        totalDias = dias;
    }
    return {
        desde: desde,
        hasta: hasta,
        dias: totalDias,
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
    const pipeline = [
        { $match: { 'agente.id': Types.ObjectId(agente.id), 'articulo.id': Types.ObjectId(articulo.id) } },
        { $unwind: '$ausencias'},
        { $match: { 'ausencias.fecha':{ $gte:desde, $lte: hasta} } },
        { $count: 'total_ausencias'}
    ]
    let total = await AusenciaPeriodo.aggregate(pipeline);
    return total.length? total[0].total_ausencias : 0;
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


