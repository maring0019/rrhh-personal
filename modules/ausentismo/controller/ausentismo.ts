import { AusenciaPeriodo } from '../schemas/ausenciaPeriodo';
import * as utils from '../commons/utils';
import * as ind from '../commons/indicadores';

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


export async function sugerirDiasAusencia(req, res, next) {
    try {
        const ausentismo = await utils.parseAusentismo(req.body);
        let ausencias = await sugerirAusentismo(ausentismo.agente, ausentismo.articulo, ausentismo.fechaDesde);
        return res.json(ausencias);
    } catch (err) {
        return next(err);
    }
}

export async function addLicencia(req, res, next) {
    try {
        const au:any = await utils.parseAusentismo(req.body);
        let ausenciasCalculadas = await generarLicencia(au.agente, au.articulo, au.fechaDesde,
                                        au.fechaHasta, au.cantidadDias);
        
        if (ausenciasCalculadas.warnings && ausenciasCalculadas.warnings.length){
            return res.json(ausenciasCalculadas);
        }
        else{
            // Generamos el nuevo ausentismo y actualizamos indicadores
            const ausentismoNew = await saveAusentismo(au, ausenciasCalculadas);
            await ind.saveIndicadoresHistoricos(ausentismoNew, ausenciasCalculadas.indicadores);
            await ind.saveIndicadores(ausenciasCalculadas.indicadores);
            return res.json(ausentismoNew);
        }
    } catch (err) {
        return next(err);
    }
}

async function saveAusentismo(ausentismo, ausenciasCalculadas){
    ausentismo.ausencias = utils.generarDiasAusencia(ausentismo, ausenciasCalculadas.ausencias);
    const obj = new AusenciaPeriodo(ausentismo);
    const objNuevo = await obj.save();
    return objNuevo
}


async function generarLicencia(agente, articulo, desde, hasta, dias){
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


async function generarAusentismo(agente, articulo, desde, hasta, dias){
    let ausencias = utils.calcularDiasAusencias(agente, articulo, desde, hasta, dias);
    let indicadores = await ind.getIndicadoresAusentismo(agente, articulo, ausencias.desde, ausencias.hasta);
    let indicadoresRecalculados = utils.distribuirAusenciasEntreIndicadores(indicadores, ausencias);  
    
    let warnings = [];
    warnings = warnings.concat(utils.formatWarningsIndicadores(await utils.checkIndicadoresGuardado(indicadoresRecalculados)));
    warnings = warnings.concat(utils.formatWarningsSuperposicion(await utils.checkSolapamientoPeriodos(agente, articulo, ausencias.desde, ausencias.hasta)));
    
    ausencias.warnings = warnings;
    
    return ausencias;
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
async function sugerirAusentismo(agente, articulo, desde){
    let indicadores = await ind.getIndicadoresAusentismo(agente, articulo, desde);
    let diasOptimoAusencia = ind.getMaxDiasDisponibles(indicadores, desde);
    let ausencias = await utils.calcularDiasAusencias(agente, articulo, desde, null, diasOptimoAusencia);
    
    let warnings = [];
    warnings = warnings.concat(utils.formatWarningsIndicadores(await utils.checkIndicadoresSugerencia(indicadores, desde)));
    warnings = warnings.concat(utils.formatWarningsSuperposicion(await utils.checkSolapamientoPeriodos(agente, articulo, ausencias.desde, ausencias.hasta)));// TODO Ver este control en la edicion

    ausencias.warnings = warnings;
    return ausencias;
}



