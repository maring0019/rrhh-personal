import * as utils from '../commons/utils';
import * as ind from '../commons/indicadores';

class AusenciasController {
    
    async addAusentismo(ausentismo){
        let ausenciasCalculadas = await calcularAusentismo(ausentismo.agente, ausentismo.articulo,
            ausentismo.fechaDesde, ausentismo.fechaHasta, ausentismo.cantidadDias);

        if (ausenciasCalculadas.warnings && ausenciasCalculadas.warnings.length){
            return ausenciasCalculadas;
        }
        else{
            return await utils.saveAusentismoNew(ausentismo, ausenciasCalculadas);
        }
    }


    async updateAusentismo(ausentismoToUpdate, ausentismoNewValues){
        let ausenciasCalculadas:any;
        if(ausentismoToUpdate.articulo.id == ausentismoNewValues.articulo.id){
            ausenciasCalculadas = await recalcularAusentismoArticuloActual(ausentismoToUpdate, ausentismoNewValues.agente, ausentismoNewValues.articulo, ausentismoNewValues.fechaDesde,
                            ausentismoNewValues.fechaHasta, ausentismoNewValues.cantidadDias)
        }
        else{
            ausenciasCalculadas = await recalcularAusentismoArticuloNuevo(ausentismoToUpdate, ausentismoNewValues.agente, ausentismoNewValues.articulo, ausentismoNewValues.fechaDesde,
                            ausentismoNewValues.fechaHasta, ausentismoNewValues.cantidadDias)
        }
        
        if (!ausenciasCalculadas.warnings || !ausenciasCalculadas.warnings.length){
            // Todo esta ok, se procede a guardar los cambios               
            return  await utils.saveAusentismoUpdated(ausentismoToUpdate, ausentismoNewValues, ausenciasCalculadas);
        }
        else{
            // Return ausencias con warnings. No guardamos nada
            return ausenciasCalculadas;    
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
    async sugerirAusentismo(agente, articulo, desde){
        let indicadores = await ind.getIndicadoresAusentismo(agente, articulo, desde);
        let diasOptimoAusencia = ind.getMaxDiasDisponibles(indicadores, desde);
        let ausencias = await utils.calcularDiasAusencias(agente, articulo, desde, null, diasOptimoAusencia);
        
        let warnings = [];
        warnings = warnings.concat(utils.formatWarningsIndicadores(await utils.checkIndicadoresSugerencia(indicadores, desde)));
        warnings = warnings.concat(utils.formatWarningsSuperposicion(await utils.checkSolapamientoPeriodos(agente, articulo, ausencias.desde, ausencias.hasta)));// TODO Ver este control en la edicion

        ausencias.warnings = warnings;
        return ausencias;
    }
}
 
export default AusenciasController;



async function calcularAusentismo(agente, articulo, desde, hasta, dias){
    let ausencias = utils.calcularDiasAusencias(agente, articulo, desde, hasta, dias);
    let indicadores = await ind.getIndicadoresAusentismo(agente, articulo, ausencias.desde, ausencias.hasta);
    let indicadoresRecalculados = utils.distribuirAusenciasEntreIndicadores(indicadores, ausencias);  
    
    let warnings = [];
    warnings = warnings.concat(utils.formatWarningsIndicadores(await utils.checkIndicadoresGuardado(indicadoresRecalculados)));
    warnings = warnings.concat(utils.formatWarningsSuperposicion(await utils.checkSolapamientoPeriodos(agente, articulo, ausencias.desde, ausencias.hasta)));
    
    ausencias.warnings = warnings;
    
    return ausencias;
}


export async function recalcularAusentismoArticuloActual(ausEnEdicion, agente, articulo, desde, hasta, dias){
    let ausencias = utils.calcularDiasAusencias(agente, articulo, desde, hasta, dias);
    
    let indicadores = await ind.getIndicadoresAusentismo(agente, articulo, ausencias.desde, ausencias.hasta);
    let indicadoresRecalculados = utils.distribuirAusenciasEntreIndicadores(indicadores, ausencias);
    let indicadoresHistoricos = await ind.getIndicadoresHistoricos(ausEnEdicion.agente, ausEnEdicion.articulo, ausEnEdicion.fechaDesde, ausEnEdicion.fechaHasta, ausEnEdicion.cantidadDias);
    let indicadoresFinales = ind.mergeIndicadores(indicadoresRecalculados, indicadoresHistoricos);
    
    let warnings = [];
    warnings = warnings.concat(utils.formatWarningsIndicadores(await utils.checkIndicadoresGuardado(indicadoresFinales)));
    warnings = warnings.concat(utils.formatWarningsSuperposicion(await utils.checkSolapamientoPeriodos(agente, articulo, ausencias.desde, ausencias.hasta, ausEnEdicion)));

    ausencias.warnings = warnings;
    return ausencias;
}

export async function recalcularAusentismoArticuloNuevo(ausEnEdicion, agente, articulo, desde, hasta, dias){
    let ausencias = utils.calcularDiasAusencias(agente, articulo, desde, hasta, dias);
    let indicadores = await ind.getIndicadoresAusentismo(agente, articulo, ausencias.desde, ausencias.hasta);
    let indicadoresRecalculados = utils.distribuirAusenciasEntreIndicadores(indicadores, ausencias);  
    
    let warnings = [];
    warnings = warnings.concat(utils.formatWarningsIndicadores(await utils.checkIndicadoresGuardado(indicadoresRecalculados)));
    warnings = warnings.concat(utils.formatWarningsSuperposicion(await utils.checkSolapamientoPeriodos(agente, articulo, ausencias.desde, ausencias.hasta, ausEnEdicion)));
    
    ausencias.warnings = warnings;
    
    return ausencias;
}