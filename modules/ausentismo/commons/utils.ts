import { Articulo } from '../schemas/articulo';

import { format } from 'util';
import { Types } from 'mongoose';
import { Feriado } from '../schemas/feriado';


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
    let articulo = await Articulo.findById(obj.id).lean(); // get articulo con formulas,
    articulo.id = obj.id;
    return articulo
}


export function parseDate(date){
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addOneDay(fecha){
    let tomorrow = new Date(fecha);
    return new Date(tomorrow.setDate(tomorrow.getDate() + 1));
}

export async function esFeriado(date){
    const esFeriado = await Feriado.findOne({ fecha: date })
    return esFeriado? true : false;
}

export async function esDiaHabil(date){
    return await esFeriado(date);
    // let esDiaHabil = true;
    // let finDeSemanas = [new Date(2019,6,20), new Date(2019,6,21), new Date(2019,6,27), new Date(2019,6,28)];
    // let feriados = [new Date(2019,6,18), new Date(2019,6,23)]
    // for (let finde of finDeSemanas){
    //     if (date.getTime() === finde.getTime()) {
    //         esDiaHabil = false;
    //         break;
    //     }
    // }
    // if (esDiaHabil){
    //     for (let feriado of feriados){
    //         if (date.getTime() === feriado.getTime()) {
    //             esDiaHabil = false;
    //             break;
    //         };
    //     }
    // }
    // return esDiaHabil;
}


export async function findObjectById(objectId, Model){
    if (!objectId || (objectId && !Types.ObjectId.isValid(objectId))) return;
    return await Model.findById(objectId);
    
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
    let textControl = `Conflicto de fechas con Articulo`;
    let warningsText = []; 
    for (const ausentismo of ausentismosPrevios){
        let textWarning = ``;
            const desde = getFormattedDate(ausentismo.fechaDesde);
            const hasta = getFormattedDate(ausentismo.fechaHasta);
            const articulo = ausentismo.articulo.codigo;
            textWarning = `${textControl} ${articulo}: (${desde} - ${hasta})`;
            warningsText.push(textWarning)    
        }
   return warningsText;
}