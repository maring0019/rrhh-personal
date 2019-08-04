import { Types } from 'mongoose';

import { IndicadorAusentismo } from '../schemas/indicador';
import { AusenciaPeriodo } from '../schemas/ausenciaPeriodo';

import * as utils from '../commons/utils';

/**
 * Dado un agente y articulo recupera un listado de indicadores del agente con
 * informacion sobre totales de ausencias, licencias ejecutadas y disponibles
 * para cada periodo definido en las formulas del articulo
 * @param agente 
 * @param articulo 
 * @param desde 
 * @param hasta 
 * @returns [IndicadorAusentismoSchema]
 */
export async function getIndicadoresAusentismo(agente, articulo, desde, hasta?){
    let indicadores = [];
    for (let formula of articulo.formulas ) {        
        if ( formula.periodo ){
            indicadores = indicadores.concat(
                await getIndicadoresConPeriodo(agente, articulo, formula, desde, hasta));   
        }
        else {
            indicadores = indicadores.concat(
                await getIndicadoresSinPeriodo(agente, articulo, formula, desde, hasta));
        }
    }
    return indicadores;
}


/**
 * Retorna un indicador aplicable unicamente a aquellos articulos que si tienen 
 * por definicion un numero acotado o maximo de ausencias en un periodo determinado.
 * Por ejemplo el articulo 80 Asuntos Personales, restringe el numero maximo de 
 * ausencias a un maximo 10 en el periodo de un anio o a solo dos en el periodo de
 * un mes.
 * Cada indicador indica totales de ausencias, licencias ejecutadas y disponibles.
 * @param agente 
 * @param articulo 
 * @param formula 
 * @param desde 
 * @param hasta
* @returns [IndicadorAusentismoSchema]
 */
export async function getIndicadoresConPeriodo(agente, articulo, formula, desde, hasta?){
    const anioDesde = desde.getFullYear();
    const anioHasta = hasta? hasta.getFullYear() : null;
    let anios = [anioDesde];
    if (anioHasta && (anioDesde != anioHasta)) anios.push(anioHasta);
    let indicadores = [];
    for ( let anio of anios){
        let indicador = await IndicadorAusentismo.findOne(
            {
                'agente.id': new Types.ObjectId(agente.id),
                'articulo.id': new Types.ObjectId(articulo.id),
                'periodo': formula.periodo.nombre, // TODO Idealmente buscar por ID???
                'vigencia': anio // TODO analizar el tema de la vigencia correctamente
            });
        if (!indicador){
            indicador = await calcularIndicadoresAusentismo(agente, articulo, formula, anio);
        }
        indicadores.push(indicador);
    }
    return indicadores;
}

/**
 * Retorna un indicador aplicable unicamente a aquellos articulos que NO tienen 
 * por definicion un numero acotado o maximo de ausencias en un periodo determinado
 * de tiempo.
 * Cada indicador indica totales de ausencias, ausencias ejecutadas y disponibles.
 * @param agente 
 * @param articulo 
 * @param formula 
 * @param desde 
 * @param hasta 
 * @returns [IndicadorAusentismoSchema]
 */
export async function getIndicadoresSinPeriodo(agente, articulo, formula, desde?, hasta?){
    let indicador:any;
    if ( formula.diasContinuos ){
        // Si la formula del articulo exige que los dias de licencias
        // sean continuos no es necesario recuperar un indicador con
        // informacion previa sobre dias disponibles
        indicador = await calcularIndicadoresAusentismo(agente, articulo, formula)
    }
    else {
        // Si la formula del articulo no exige que los dias de licencias
        // sean continuos, se deben recuperar los indicadores previos
        // existentes (es decir el historico de ausencias)
        indicador = await IndicadorAusentismo.findOne(
            {
                'agente.id': new Types.ObjectId(agente.id),
                'articulo.id': new Types.ObjectId(articulo.id),
                'periodo': null,
            });
        if (!indicador) indicador = await calcularIndicadoresAusentismo(agente, articulo, formula);
    }
    return indicador;
}


export async function getIndicadoresLicencia(agente, articulo, formula, desde?, hasta?){
    let indicadores = await IndicadorAusentismo.find(
        {
            'agente.id': new Types.ObjectId(agente.id),
            'articulo.id': new Types.ObjectId(articulo.id),
            'vencido': false
        }).sort({ vigencia: 1 });
    return indicadores;
}


/**
 * Calcula los indicadores a la fecha para un agente, articulo y formula en particular.
 * Si un articulo dispone de varias formulas, es probable que este metodo sea llamado
 * por cada formula del articulo.
 * @param agente 
 * @param articulo 
 * @param formula 
 * @param anio 
 */
export async function calcularIndicadoresAusentismo(agente, articulo, formula, anio?){
    let indicadorAusentismo:any= {
        agente: agente,
        articulo: articulo,
        vigencia: anio,
        periodo: formula.periodo? formula.periodo.nombre : null,
        intervalos: []
    }
    indicadorAusentismo.intervalos = await calcularIndicadoresPorIntervalo(
                                        agente, articulo, formula, anio);
    return indicadorAusentismo;
}

export async function calcularIndicadoresPorIntervalo(agente, articulo, formula, anio?){
    let intervalos = [];
    let indicadoresIntervalo: any;
    if (!formula.periodo){
        if ( formula.diasContinuos ){
            indicadoresIntervalo = {
                totales: formula.limiteAusencias,
                ejecutadas: 0,
                disponibles: formula.limiteAusencias
            }
        }
        else{
            let totales = formula.limiteAusencias;
            let ejecutadas = await getTotalAusenciasPorArticulo(agente, articulo);
            indicadoresIntervalo = {
                totales: formula.limiteAusencias,
                ejecutadas: ejecutadas,
                disponibles: totales - ejecutadas
            }
        }
        intervalos.push(indicadoresIntervalo)
    }
    else{
        let periodoConfiguracion = constantes[formula.periodo.nombre];
        for ( let int of periodoConfiguracion.intervalos){
            let desde = int.desde? new Date(anio, int.desde.mes, int.desde.dia) : null;
            let hasta = int.hasta? new Date(anio, int.hasta.mes, int.hasta.dia) : null;
            let totales = formula.limiteAusencias;
            let ejecutadas = await getTotalAusenciasPorArticulo(agente, articulo, desde, hasta);
            let disponibles = totales - ejecutadas;     
            indicadoresIntervalo = {
                desde: desde,
                hasta: hasta,
                totales: totales,
                ejecutadas: ejecutadas,
                disponibles: disponibles
            }
            intervalos.push(indicadoresIntervalo)
        };
    }
    return intervalos;
}


/**
 * Determina el numero total de ausencias de un agente para un articulo en 
 * particular en un periodo determinado. 
 * @param agente 
 * @param articulo 
 * @param desde 
 * @param hasta 
 */
export async function getTotalAusenciasPorArticulo(agente, articulo, desde?, hasta?){
    let pipeline:any = [
        { $match: { 'agente.id': Types.ObjectId(agente.id), 'articulo.id': Types.ObjectId(articulo.id) } },
        { $unwind: '$ausencias'}
    ]
    if (desde && hasta){
        // Filtramos por fecha desde y hasta solo si estos params estan presentes
        pipeline.push({ $match: { 'ausencias.fecha':{ $gte:desde, $lte: hasta} } });
    }
    // Finalmente contabilizamos el total de ausencias
    pipeline.push({ $count: 'total_ausencias'})
        
    let total = await AusenciaPeriodo.aggregate(pipeline);
    return total.length? total[0].total_ausencias : 0;
}

export async function getTotalLicenciasDisponibles(agente, articulo){
    let pipeline:any = [
        { 
            $match: { 
                'agente.id': Types.ObjectId(agente.id),
                'articulo.id': Types.ObjectId(articulo.id),
                'vencido': false
            }
        } ,
        {
            $unwind: '$intervalos'
        },
        {
            $group: {
                _id : null,
                total : { $sum: '$intervalos.disponibles'}
            }
        }
     ]
    
    let total = await IndicadorAusentismo.aggregate(pipeline);
    return total.length? total[0].total : 0;
}


export async function getIndicadoresHistoricos(agente, articulo, desde, hasta, dias){
    let ausencias = utils.calcularDiasAusencias(agente, articulo, desde, hasta, dias);
    let indicadores = await getIndicadoresAusentismo(agente, articulo, ausencias.desde, ausencias.hasta);
    let indicadoresRecalculados = utils.distribuirAusenciasEntreIndicadores(indicadores, ausencias);
    let indicadoresHistoricos = rollbackIndicadores(indicadoresRecalculados);
    return indicadoresHistoricos;
}

function rollbackIndicadores(indicadores){
    for (let indicador of indicadores){
        for (let intervalo of indicador.intervalos){
            intervalo.ejecutadas = intervalo.ejecutadas - intervalo.asignadas;
            intervalo.disponibles = intervalo.disponibles + intervalo.asignadas; 
        }
    }
    return indicadores;
}


export function mergeIndicadores(indicadoresNuevos, indicadoresPrevios){
    for (let indNuevo of indicadoresNuevos){
        for (let intervalo of indNuevo.intervalos){
            const intEncontrado = findIntervalo(intervalo, indicadoresPrevios);
            if (intEncontrado){
                intervalo.ejecutadas = intEncontrado.ejecutadas;
                intervalo.disponibles = intEncontrado.disponibles;
            }
            
        }
    }
    return indicadoresNuevos;
}

function findIntervalo(intervalo, indicadores){
    let intervaloEncontrado;
    for (const indicador of indicadores){
        for (const int of indicador.intervalos){
            if (int.desde.getTime() == intervalo.desde.getTime() &&
                int.hasta.getTime() == intervalo.hasta.getTime()){
                    intervaloEncontrado = int;
                    break;
                }
        }
        if (intervaloEncontrado) break;
    }   
    return intervaloEncontrado;
}

export const constantes = {
    PERIODO_INDETERMINADO: {
        intervalos: [{}]
    },
    PERIODO_CONSTANTE: {
        intervalos: [{desde: {dia:1, mes:0}, hasta:{dia:31, mes:11 } }]
    },
    PERIODO_ANUAL: {
        intervalos: [{desde: {dia:1, mes:0}, hasta:{dia:31, mes:11 } }]
    },
    PERIODO_TRIMESTRE: {
        intervalos: [
            {desde:{dia:1, mes:0}, hasta:{dia:31, mes:2}},
            {desde:{dia:1, mes:3}, hasta:{dia:30, mes:5}},
            {desde:{dia:1, mes:6}, hasta:{dia:30, mes:8}},
            {desde:{dia:1, mes:9}, hasta:{dia:31, mes:11}}]
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