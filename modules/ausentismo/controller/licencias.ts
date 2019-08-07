import * as utils from '../commons/utils';
import * as ind from '../commons/indicadores';


class LicenciasController {
    
    async addAusentismo(ausentismo){
        let ausenciasCalculadas = await calcularLicencia(ausentismo.agente, ausentismo.articulo,
            ausentismo.fechaDesde, ausentismo.fechaHasta, ausentismo.cantidadDias);

        if (ausenciasCalculadas.warnings && ausenciasCalculadas.warnings.length){
            return ausenciasCalculadas;
        }
        else{
            // Generamos el nuevo ausentismo y actualizamos indicadores
            const ausentismoNew = await utils.saveAusentismoNew(ausentismo, ausenciasCalculadas);
            await ind.saveIndicadoresHistoricos(ausentismoNew, ausenciasCalculadas.indicadores);
            await ind.saveIndicadores(ausenciasCalculadas.indicadores);
            return ausentismoNew;
        }
    }

    async updateAusentismo(ausentismoToUpdate, ausentismoNewValues){
        let ausenciasCalculadas = await editarLicencia(ausentismoToUpdate, ausentismoNewValues.agente,
            ausentismoNewValues.articulo, ausentismoNewValues.fechaDesde, ausentismoNewValues.fechaHasta, ausentismoNewValues.cantidadDias);
        
        if (!ausenciasCalculadas.warnings || !ausenciasCalculadas.warnings.length){
            
            let ausentismoUpdated:any;
            if(ausentismoToUpdate.articulo.id == ausentismoNewValues.articulo.id){
                ausentismoUpdated = await utils.saveAusentismoUpdated(ausentismoToUpdate, ausentismoNewValues, ausenciasCalculadas)
                await ind.deleteIndicadoresHistoricos(ausentismoToUpdate);
                await ind.saveIndicadoresHistoricos(ausentismoToUpdate, ausenciasCalculadas.indicadores);
                await ind.saveIndicadores(ausenciasCalculadas.indicadores);
            }
            else{
                ausentismoUpdated = await utils.saveAusentismoUpdated(ausentismoToUpdate, ausentismoNewValues, ausenciasCalculadas)
                await ind.deleteAndUpdateIndicadoresHistoricos(ausentismoToUpdate);
            }
            return ausentismoUpdated;
        }
        else{
            // Return ausencias con warnings. No guardamos nada
            return ausenciasCalculadas;    
        }
    }

    async sugerirAusentismo(agente, articulo, desde){}
}
export default LicenciasController;


export async function editarLicencia(ausEnEdicion, agente, articulo, desde, hasta, dias){
    let ausencias:any;
    if(ausEnEdicion.articulo.id == articulo.id){
        ausencias = recalcularLicenciaArticuloActual(ausEnEdicion, agente, articulo, desde, hasta, dias)
    }
    else{
        ausencias = recalcularLicenciaArticuloNuevo(ausEnEdicion, agente, articulo, desde, hasta, dias)
    }
    return ausencias;
}

async function calcularLicencia(agente, articulo, desde, hasta, dias){
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


export async function recalcularLicenciaArticuloActual(licEnEdicion, agente, articulo, desde, hasta, dias){
    let ausencias = utils.calcularDiasAusencias(agente, articulo, desde, hasta, dias);
    
    let indicadoresActuales = await ind.getIndicadoresLicencia(agente, articulo, ausencias.desde, ausencias.hasta);
    let indicadoresHistoricos = await ind.getIndicadoresLicenciaHistoricos(licEnEdicion);
    let indicadoresCorregidos = ind.mergeIndicadores(indicadoresActuales, indicadoresHistoricos);
    let indicadoresRecalculados = await utils.distribuirLicenciasEntreIndicadores(agente, articulo, indicadoresCorregidos, ausencias);  

    let warnings = [];
    warnings = warnings.concat(utils.formatWarningsIndicadores(await utils.checkIndicadoresGuardado(indicadoresRecalculados)));
    warnings = warnings.concat(utils.formatWarningsSuperposicion(await utils.checkSolapamientoPeriodos(agente, articulo, ausencias.desde, ausencias.hasta, licEnEdicion)));
    
    ausencias.warnings = warnings;
    ausencias.indicadores = indicadoresRecalculados;
    return ausencias;
}

export async function recalcularLicenciaArticuloNuevo(licEnEdicion, agente, articulo, desde, hasta, dias){
    let ausencias = utils.calcularDiasAusencias(agente, articulo, desde, hasta, dias);
    let indicadores = await ind.getIndicadoresAusentismo(agente, articulo, ausencias.desde, ausencias.hasta);
    let indicadoresRecalculados = await utils.distribuirAusenciasEntreIndicadores(indicadores, ausencias);  
    
    let warnings = [];
    warnings = warnings.concat(utils.formatWarningsIndicadores(await utils.checkIndicadoresGuardado(indicadoresRecalculados)));
    warnings = warnings.concat(utils.formatWarningsSuperposicion(await utils.checkSolapamientoPeriodos(agente, articulo, ausencias.desde, ausencias.hasta, licEnEdicion)));
    
    ausencias.warnings = warnings;
    
    return ausencias;
}


export async function sugerirLicencia(agente, articulo, fechaDesde){
    
}


