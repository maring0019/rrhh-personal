import { Articulo } from '../schemas/articulo';

import { format } from 'util';
import { Types } from 'mongoose';
import { Feriado } from '../schemas/feriado';
import { Franco } from '../schemas/franco';


export async function parseAusentismo(obj){
    let ausentismo = {
        _id: obj._id, 
        agente: obj.agente, 
        articulo: obj.articulo? await parseArticulo(obj.articulo): null,
        fechaDesde: obj.fechaDesde? parseDate(new Date(obj.fechaDesde)) : null,
        fechaHasta: obj.fechaHasta? parseDate(new Date(obj.fechaHasta)) : null,
        cantidadDias: obj.cantidadDias,
        observacion: obj.observacion,
        adicional: obj.adicional,
        extra: obj.extra,
        ausencias: obj.ausencias? parseAusencias(obj.ausencias) : []
    };
    return ausentismo;
}

export function parseAusencias(ausencias){
    for (const aus of ausencias) {
        aus.fecha = parseDate(new Date(aus.fecha));
    }
    return ausencias;
}

export async function parseArticulo(obj){
    let articulo = await Articulo.findById(obj._id).lean(); // get articulo con formulas,
    articulo._id = obj._id;
    return articulo
}


export function parseDate(date){
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addOneDay(fecha){
    let tomorrow = new Date(fecha);
    return new Date(tomorrow.setDate(tomorrow.getDate() + 1));
}

export async function esFranco(agente, date){
    const esFranco = await Franco.findOne({ fecha: date, 'agente._id': Types.ObjectId(agente._id)});
    return esFranco? true : false;
}

export async function esFeriado(date){
    const esFeriado = await Feriado.findOne({ fecha: date });
    return esFeriado? true : false;
}

export function esFinDeSemana(date){
    return  (date.getDay() == 6 || date.getDay() == 0);
}

export async function esDiaHabil(agente, date){
    return  (!(await esFeriado(date)) && !esFinDeSemana(date) && !(await esFranco(agente, date)));
}


export async function findObjectById(objectId, Model){
    if (!objectId || (objectId && !Types.ObjectId.isValid(objectId))) return;
    return await Model.findById(objectId);
}

export function isSameDay(d1, d2){
    const f1:Date = this.parseDate(d1);
    const f2:Date = this.parseDate(d2);
    return f1.getTime() == f2.getTime();
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
                textWarning = `${textControl} (${intervalo.totales} dias). Periodo ${indicador.periodo}: (${desde} - ${hasta})`;
            }
        }
        else{
            // TODO Ver si es posible mejorar el msj en este caso. Por ejemplo
            // si se trata de una licencia, mostrar los dias disponibles por anio
            textWarning = `${textControl}. ${textWarning}`;
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