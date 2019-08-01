import { Ausencia } from '../schemas/ausencia';
import { AusenciaPeriodo } from '../schemas/ausenciaPeriodo';
import { Articulo } from '../schemas/articulo';

import { format } from 'util';

export function calcularDiasAusencias(agente, articulo, desde, hasta?, dias?){
    let ausencias:any;
    if (articulo.diasCorridos){
        ausencias = calculaDiasCorridos(desde, hasta, dias);
    }

    if (articulo.diasHabiles){
        ausencias = calculaDiasHabiles(desde, hasta, dias);
    }
    return ausencias;
}


export function calculaDiasCorridos(desde:Date, hasta?:Date, dias?:number){
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
        ausencias: ausencias,
        warnings:[]
    }
}


export function calculaDiasHabiles(desde:Date, hasta?:Date, dias?){
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
        ausencias: ausencias,
        warnings: []
    }
}


/**
 * "Distribuye" cada uno de los dias calculados del ausentismo entre los intervalos del
 * periodo de los indicadores. 
 * De esta forma se determina finalmente cuantos dias se van a asignar a cada intervalo
 * del periodo. Por ejemplo si tengo 2 indicadores. Uno con un periodo anual y otro con
 * un periodo mensual, y un ausentismo cargado con fecha desde 30/3, fecha hasta 02/04 y
 * un cantidad de 4 dias de ausencias, entonces se retornaran dos indicadores con la info
 * siguiente:
 *            * Un indicador anual, con un intervalo, y 4 dias asignados en ese intervalo
 *            * Un indicador mensual, con dos intervalos con fechas:
 *                  * 01/03 al 31/03 con 2 dias asignados en ese intervalo
 *                  * 01/04 al 30/04 con 2 dias asignados en ese intervalo
 * @param indicadores 
 * @param ausentismo 
 */
export function distribuirAusenciasEntreIndicadores(indicadores, ausentismo){
    let indicadoresFiltrados = [];
    for (let indicador of indicadores){
        indicadoresFiltrados.push(minimizarIntervalosIndicador(indicador, ausentismo.desde, ausentismo.hasta));
    }
    indicadores = indicadoresFiltrados;
    for (let indicador of indicadores){
        for (let intervalo of indicador.intervalos){
            intervalo.asignadas = 0; // Inicializamos en 0 el contador
            if ( !indicador.periodo || 
                (intervalo.desde <= ausentismo.desde && 
                intervalo.hasta >= ausentismo.hasta)){
                // Asignamos el total de dias de ausnecias al intervalo
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
    return indicadores;
}

/**
 * Utilidad para reducir el nro de intervalos a analizar dentro de un indicador
 * Retorna el mismo indicador con solo los intervalos de interes, que son aquellos
 * comprendidos dentro del periodo desde y hasta
 * @param indicador 
 * @param desde 
 * @param hasta 
 */
export function minimizarIntervalosIndicador(indicador, desde, hasta){
    let filteredIntervalos = [];
    if (indicador.periodo){
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
        indicador.intervalos = filteredIntervalos;
    }
    return indicador;
}


export function checkIndicadoresGuardado(indicadores){
    let indicadoresConProblemas = [];
    for (const indicador of indicadores){
        let intervaloConProblemas:any;
        for (const intervalo of indicador.intervalos){
            const restoDiasDisponibles = intervalo.disponibles - intervalo.asignadas;
            if( restoDiasDisponibles < 0) {
                intervaloConProblemas = intervalo;
                break;
            }
        }
        if (intervaloConProblemas){
            indicador.intervalos = [intervaloConProblemas];
            indicadoresConProblemas.push(indicador)
        }     
    }
    return indicadoresConProblemas;
}

/**
 * Identifica y retorna indicadores que hayan alcanzado el numero maximo de ausencias
 * permitida por periodo. El listado de indicadores con problemas solo incluira el
 * intervalo del periodo que presenta problemas de acuerdo a la fecha de interes.
 * Por ejemplo si un indicador indica que para el mes de abril no hay mas ausencias
 * disponibles y la fecha de interes (fecha inicio del ausentismo) es precisamente
 * un dia de abril, entonces este indicador se retornara como parte del control. 
 * Si no hay problemas detectados se retorna un array vacio.
 * @param indicadores Listado total de indicadores para un articulo en particular
 * @param fechaInteres Es la fecha desde del ausentismo a cargar
 * @param ausentismo Opcional. Si esta presente 
 */
export function checkIndicadoresSugerencia(indicadores, fechaInteres, ausentismo?){
    let indicadoresConProblemas = [];
    for (const indicador of indicadores){
        let intervaloConProblemas:any;
        for (const intervalo of indicador.intervalos){
            if (!intervalo.hasta || (intervalo.hasta >= fechaInteres)) {
                if( intervalo.disponibles <= 0) {
                    intervaloConProblemas = intervalo;
                }
                break;
            }
        }
        if (intervaloConProblemas){
            indicador.intervalos = [intervaloConProblemas];
            indicadoresConProblemas.push(indicador)
        }     
    }
    return indicadoresConProblemas;
}

/**
 * Busca ausencias previas existentes en un periodo determinado para un agente.
 * El parametro ausentismo se utiliza unicamente en el caso que se este en modo 
 * edicion, para evitar controlar con el mismo ausentismo que se esta editando
 * @param agente 
 * @param articulo 
 * @param desde 
 * @param hasta 
 * @param ausentismo Opcional. Unicamente necesario en modo edicion
 */
export async function checkSolapamientoPeriodos(agente, articulo, desde, hasta, ausentismo?){
    let ausentismos = await AusenciaPeriodo.find({
        'agente.id': agente.id,
        'ausencias': {
            $elemMatch: {
                fecha: {
                    $gte: desde,
                    $lte: hasta
                }
            }
        }
    });
    if (ausentismo){
        ausentismos = ausentismos.filter(au => au.id != ausentismo.id);
    }
    return ausentismos;
}


export async function parseAusentismo(obj){
    let ausentismo = {
        id: obj.id, 
        agente: obj.agente, 
        articulo: obj.articulo? await parseArticulo(obj.articulo): null,
        fechaDesde: obj.fechaDesde? parseDate(new Date(obj.fechaDesde)) : null,
        fechaHasta: obj.fechaHasta? parseDate(new Date(obj.fechaHasta)) : null,
        cantidadDias: obj.cantidadDias,
        observacion: obj.observacion,
        adicional: obj.adicional,
        extra: obj.extra,
        ausencias: obj.ausencias? obj.ausencias : []
    };
    return ausentismo;
}

export async function parseArticulo(obj){
    const art = await Articulo.findById(obj.id).lean(); // get articulo con formulas,
    let articulo = {
        id: obj.id,
        codigo: art.codigo,
        nombre: art.nombre,
        descripcion: art.descripcion,
        diasCorridos:art.diasCorridos,
        diasHabiles: art.diasHabiles,
        formulas: art.formulas 
    };
    return articulo
}


export function parseDate(date){
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
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


export function generarDiasAusencia(ausentismo, diasAusencia){
    let ausencias = [];
    for (const dia of diasAusencia){
        const ausencia = new Ausencia({
            agente: ausentismo.agente, 
            fecha: parseDate(new Date(dia)),
            articulo: ausentismo.articulo
            }
        )
        ausencias.push(ausencia);
    }
    return ausencias;
}

export function getFormattedDate(date) {
    const month = format(date.getMonth() + 1);
    const day = format(date.getDate());
    const year = format(date.getFullYear());
    return  day + "/" + month + "/" + year;
}

export function formatWarningsIndicadores(indicadores){
    let textControl = `Limite de ausencias superado`;
    let warningsText = []; 
    for (const indicador of indicadores){
        let textWarning = ``;
        if (indicador.periodo){
            for (const intervalo of indicador.intervalos){
                const desde = getFormattedDate(intervalo.desde);
                const hasta = getFormattedDate(intervalo.hasta);
                textWarning = `${textControl} (${intervalo.totales} dias). ${indicador.periodo}: (${desde} - ${hasta})`;
            }
        }
        else{
            textWarning = `${textControl}. ${textWarning} Periodo Total.`;
        }
        warningsText.push(textWarning)
    }
   return warningsText;
}

export function formatWarningsSuperposicion(ausentismosPrevios){
    let textControl = `Conflicto de fechas con Articulo `;
    let warningsText = []; 
    for (const ausentismo of ausentismosPrevios){
        let textWarning = ``;
            const desde = getFormattedDate(ausentismo.fechaDesde);
            const hasta = getFormattedDate(ausentismo.fechaHasta);
            const articulo = ausentismo.articulo.codigo;
            textWarning = `${textControl}. ${articulo}: (${desde} - ${hasta})`;
            warningsText.push(textWarning)    
        }
   return warningsText;
}