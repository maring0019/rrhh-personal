import { Ausencia } from '../schemas/ausencia';
import { AusenciaPeriodo } from '../schemas/ausenciaPeriodo';

import * as ind from './indicadores'; 
import * as utils from './utils';


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
            if (utils.esDiaHabil(fechaAusencia)){
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
            while (!utils.esDiaHabil(fechaAusencia)){
                fechaAusencia = utils.addOneDay(fechaAusencia);    
            }        
            hasta = fechaAusencia;
            ausencias.push(new Date(fechaAusencia));
            i = i + 1;
            fechaAusencia = utils.addOneDay(fechaAusencia);    
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
                // Asignamos el total de dias de ausencias al intervalo
                intervalo.asignadas = ausentismo.dias;
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

export async function distribuirLicenciasEntreIndicadores(agente, articulo, indicadores, ausencias){
    console.log('Llegamos a distribuir')
    console.log(indicadores)
    let totalDiasLicencia = ausencias.dias;
    let totalDiasDisponibles = await ind.getTotalLicenciasDisponibles(agente, articulo);
    if (totalDiasDisponibles && (totalDiasDisponibles < totalDiasLicencia)){
        // No es posible asignar las licencias requeridas. Hay que alertar!
        indicadores[0].intervalos[0].asignadas = totalDiasLicencia; 
    }
    else{
        // Es posible asignar las licencias requeridas. Hay que ajustar los
        // indicadores para reflejar cuantos dias se restan a cada anio
        for (let indicador of indicadores){
            for (const intervalo of indicador.intervalos){
                const diasDisponibles = intervalo.totales - intervalo.ejecutadas;
                if ( diasDisponibles ==  0 ) break;
                if ( diasDisponibles <=  totalDiasLicencia ){
                    totalDiasLicencia = totalDiasLicencia - diasDisponibles;
                    intervalo.asignadas = diasDisponibles;
                }
                else{
                    intervalo.asignadas = totalDiasLicencia;
                    totalDiasLicencia = 0;
                }
            }   
        } 
    }
    console.log('Salimos a distribuir')
    return indicadores;
}

export function checkIndicadoresGuardado(indicadores){
    let indicadoresConProblemas = [];
    for (const indicador of indicadores){
        let intervaloConProblemas:any;
        for (const intervalo of indicador.intervalos){
            const diasDisponibles = intervalo.totales - intervalo.ejecutadas;
            const restoDiasDisponibles = diasDisponibles - intervalo.asignadas;
            if( intervalo.totales && restoDiasDisponibles < 0) {
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
            if (!intervalo.limiteAusencias || !intervalo.hasta || (intervalo.hasta >= fechaInteres)) {
                const diasDisponibles = intervalo.totales - intervalo.ejecutadas;
                if( diasDisponibles < 0) {
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


export async function insertAusentismo(ausentismo){
    const obj = new AusenciaPeriodo(ausentismo);
    return await obj.save();
}

export async function deleteAusentismo(ausentismo){
    let obj = await utils.findObjectById(ausentismo._id, AusenciaPeriodo);
    return await obj.delete();
}


export function generarDiasAusencia(ausentismo, diasAusencia){
    let ausencias = [];
    for (const dia of diasAusencia){
        const ausencia = new Ausencia({
            agente: ausentismo.agente, 
            fecha: utils.parseDate(new Date(dia)),
            articulo: ausentismo.articulo
            }
        )
        ausencias.push(ausencia);
    }
    return ausencias;
}
