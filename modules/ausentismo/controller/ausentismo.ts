import { AusenciaPeriodo } from '../schemas/ausenciaPeriodo';
import * as utils from '../commons/utils';
import * as ind from '../commons/indicadores';
// import { IndicadorAusentismo } from '../schemas/indicador';
// import { IndicadorAusentismo } from '../schemas/indicador';

export async function addAusentismo(req, res, next) {
    try {
        const au = await utils.parseAusentismo(req.body);
        let ausenciasCalculadas = await generarAusentismo(au.agente, au.articulo, au.fechaDesde,
                                        au.fechaHasta, au.cantidadDias);
        
        if (ausenciasCalculadas.warnings && ausenciasCalculadas.warnings.length){
            return res.json(ausenciasCalculadas);
        }
        else{
            au.ausencias = utils.generarDiasAusencia(au, ausenciasCalculadas.ausencias);
            const obj = new AusenciaPeriodo(au);
            const objNuevo = await obj.save();
            return res.json(objNuevo);
        }
    } catch (err) {
        return next(err);
    }
}

export async function addLicencia(req, res, next) {
    try {
        const au = await utils.parseAusentismo(req.body);
        let ausenciasCalculadas = await generarLicencia(au.agente, au.articulo, au.fechaDesde,
                                        au.fechaHasta, au.cantidadDias);
        
        if (ausenciasCalculadas.warnings && ausenciasCalculadas.warnings.length){
            return res.json(ausenciasCalculadas);
        }
        else{
            // Actualizamos los indicadores
            for (const indicador of ausenciasCalculadas.indicadores){
                for (let intervalo of indicador.intervalos){
                    intervalo.ejecutadas = intervalo.ejecutadas + intervalo.asignadas;
                    intervalo.disponibles = intervalo.totales - intervalo.ejecutadas;
                    intervalo.asignadas = 0;
                }
                await indicador.save()
            }
            // Generamos el nuevo ausentismo
            au.ausencias = utils.generarDiasAusencia(au, ausenciasCalculadas.ausencias);
            const obj = new AusenciaPeriodo(au);
            const objNuevo = await obj.save();
            return res.json(objNuevo);
        }
    } catch (err) {
        return next(err);
    }
}

export async function generarLicencia(agente, articulo, desde, hasta, dias){
    let ausencias = utils.calcularDiasAusencias(agente, articulo, desde, hasta, dias);
    let indicadores = await ind.getIndicadoresLicencia(agente, articulo, ausencias.desde, ausencias.hasta);
    let indicadoresRecalculados = await utils.distribuirLicenciasEntreIndicadores(agente, articulo, indicadores, ausencias);  

    let warnings = [];
    warnings = warnings.concat(utils.formatWarningsIndicadores(await utils.checkIndicadoresGuardado(indicadoresRecalculados)));
    warnings = warnings.concat(utils.formatWarningsSuperposicion(await utils.checkSolapamientoPeriodos(agente, articulo, ausencias.desde, ausencias.hasta)));
    
    ausencias.warnings = warnings;
    ausencias.indicadores = indicadoresRecalculados;
    return ausencias;
}


export async function generarAusentismo(agente, articulo, desde, hasta, dias){
    let ausencias = utils.calcularDiasAusencias(agente, articulo, desde, hasta, dias);
    let indicadores = await ind.getIndicadoresAusentismo(agente, articulo, ausencias.desde, ausencias.hasta);
    let indicadoresRecalculados = utils.distribuirAusenciasEntreIndicadores(indicadores, ausencias);  
    
    let warnings = [];
    warnings = warnings.concat(utils.formatWarningsIndicadores(await utils.checkIndicadoresGuardado(indicadoresRecalculados)));
    warnings = warnings.concat(utils.formatWarningsSuperposicion(await utils.checkSolapamientoPeriodos(agente, articulo, ausencias.desde, ausencias.hasta)));
    
    ausencias.warnings = warnings;
    
    return ausencias;
}


export async function sugerirDiasAusencia(req, res, next) {
    try {
        const ausentismo = await utils.parseAusentismo(req.body);
        let ausencias = await sugerirAusentismo(ausentismo.agente, ausentismo.articulo, ausentismo.fechaDesde);
        return res.json(ausencias);
    } catch (err) {
        return next(err);
    }
}

/**
 * Sugiere un nro optimo de ausencias para un agente a partir de la seleccion
 * de un articulo y una fecha de inicio desde. Se utilizan las formulas definidas
 * en el articulo para los controles. Se indican cantidad de dias, fecha hasta
 * y listado de dias de ausencias para el periodo que corresponda. Si durante el
 * proceso se identifican problemas como por ejemplo numero maximo de dias de
 * ausencias superados, se indican en un listado de warnings.
 * @param ausentismo 
 */
export async function sugerirAusentismo(agente, articulo, desde){
    let indicadores = await ind.getIndicadoresAusentismo(agente, articulo, desde);
    let ausencias = await utils.calcularDiasAusencias(agente, articulo, desde, null, getMaxDiasDisponibles(indicadores, desde))
    
    let warnings = [];
    warnings = warnings.concat(utils.formatWarningsIndicadores(await utils.checkIndicadoresSugerencia(indicadores, desde)));
    // TODO Ver este control en la edicion
    warnings = warnings.concat(utils.formatWarningsSuperposicion(await utils.checkSolapamientoPeriodos(agente, articulo, ausencias.desde, ausencias.hasta)));

    ausencias.warnings = warnings;
    return ausencias;
}


/**
 * Identifica el indicador mas relevante y retorna el numero maximos de dias 
 * disponibles para el agente en ese periodo/intervalo. Es una
 * utilidad para luego simplificar los controles sobre los dias disponibles.
 * Asumimos que el indicador mas relevante es aquel que tiene un periodo con
 * la mayor cantidad de intervalos y uno de esos intervalos esta dentro de la
 * fecha de interes. Por ejemplo si el indicador tiene un periodo anual y otro
 * mensual, entonces vamos a retornar el indicador con el periodo mensual y el
 * intervalo mas proximo a la fecha de interes
 * @param indicadores Listado de indicadores para un articulo en particular
 * @param fechaInteres Es la fecha desde del ausentismo a cargar  
 */
export function getMaxDiasDisponibles(indicadores, fechaInteres){
    let indicadoresFiltrados = [];
    const limit = 999999;
    let maxDias = limit;
    for (let indicador of indicadores){
        indicadoresFiltrados.push(utils.minimizarIntervalosIndicador(indicador, fechaInteres, fechaInteres));
    }
    for (const indicador of indicadoresFiltrados){
        for(const intervalo of indicador.intervalos)
            if (intervalo.disponibles < maxDias) maxDias = intervalo.disponibles;
    }
    return (maxDias < limit)? maxDias : 0;
}

