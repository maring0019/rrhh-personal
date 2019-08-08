import * as utils from '../commons/utils';
import * as aus from '../commons/ausentismo';
import * as ind from '../commons/indicadores';
import LicenciasController from './licencias';

class AusenciasController {
    
    async addAusentismo(ausentismo){
        let ausencias = await calcularAusentismo(ausentismo.agente, ausentismo.articulo,
            ausentismo.fechaDesde, ausentismo.fechaHasta, ausentismo.cantidadDias);

        if (ausencias.warnings && ausencias.warnings.length){
            return ausencias;
        }
        else{
            return await aus.insertAusentismo(ausentismo, ausencias);
        }
    }

       /**
     * Verifica si se modifico el articulo en la edicion y delega la actualizacion
     * segun corresponda
     * @param ausToUpdate 
     * @param ausNewValues 
     */
    async updateAusentismo(ausToUpdate, ausNewValues){
        if(!ausNewValues.articulo.descuentaDiasLicencia){
            return await this.updateAusentismoToAusentismo(ausToUpdate, ausNewValues);
        }
        else {
            return await this.updateAusentismoToLicencia(ausToUpdate, ausNewValues);
        }
    }

    async updateAusentismoToAusentismo(ausToUpdate, ausNewValues){
        let ausencias:any;
        if (ausToUpdate.articulo.id == ausNewValues.articulo.id){
            ausencias = await recalcularAusentismoArticuloActual(ausToUpdate, ausNewValues.agente,
                    ausNewValues.articulo, ausNewValues.fechaDesde, ausNewValues.fechaHasta, ausNewValues.cantidadDias)
        }
        else{
            ausencias = await recalcularAusentismoArticuloNuevo(ausToUpdate, ausNewValues.agente,
                    ausNewValues.articulo, ausNewValues.fechaDesde, ausNewValues.fechaHasta, ausNewValues.cantidadDias)
        }

        if (ausencias.warnings && ausencias.warnings.length){
            // Return ausencias con warnings. No guardamos nada
            return ausencias;    
        }
        else{
            // Todo esta ok, se procede a guardar los cambios                           
            await aus.deleteAusentismo(ausToUpdate);
            return await aus.insertAusentismo(ausNewValues, ausencias);
        }
    }

    async updateAusentismoToLicencia(ausToUpdate, ausNewValues){
        let licController = new LicenciasController();
        // let ausencias = await licController.calcularAusentismo(ausNewValues.agente,ausNewValues.articulo,
        //                     ausNewValues.fechaDesde, ausNewValues.fechaHasta, ausNewValues.cantidadDias)
        let ausencias = await licController.recalcularAusentismoArticuloActual(ausToUpdate,ausNewValues.agente,ausNewValues.articulo,
            ausNewValues.fechaDesde, ausNewValues.fechaHasta, ausNewValues.cantidadDias)
        // let ausencias = await recalcularAusentismoArticuloActual(ausToUpdate, ausNewValues.agente,
        //     ausNewValues.articulo, ausNewValues.fechaDesde, ausNewValues.fechaHasta, ausNewValues.cantidadDias);

        if (ausencias.warnings && ausencias.warnings.length){
            // Return ausencias con warnings. No guardamos nada
            return ausencias;    
        }
        else{
            // Todo esta ok, se procede a guardar los cambios                           
            let ausentismoNew = await aus.insertAusentismo(ausNewValues, ausencias);
            await aus.deleteAusentismo(ausToUpdate);
            await ind.insertIndicadoresHistoricos(ausentismoNew, ausencias.indicadores);
            await ind.updateIndicadores(ausencias.indicadores);
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
        let ausencias = await aus.calcularDiasAusencias(agente, articulo, desde, null, diasOptimoAusencia);
        
        let warnings = [];
        warnings = warnings.concat(utils.formatWarningsIndicadores(await aus.checkIndicadoresSugerencia(indicadores, desde)));
        warnings = warnings.concat(utils.formatWarningsSuperposicion(await aus.checkSolapamientoPeriodos(agente, articulo, ausencias.desde, ausencias.hasta)));// TODO Ver este control en la edicion

        ausencias.warnings = warnings;
        return ausencias;
    }
}
 
export default AusenciasController;



async function calcularAusentismo(agente, articulo, desde, hasta, dias){
    let ausencias = aus.calcularDiasAusencias(agente, articulo, desde, hasta, dias);
    let indicadores = await ind.getIndicadoresAusentismo(agente, articulo, ausencias.desde, ausencias.hasta);
    let indicadoresRecalculados = aus.distribuirAusenciasEntreIndicadores(indicadores, ausencias);  
    for (const i of indicadoresRecalculados) console.log(i.intervalos)

    let warnings = [];
    warnings = warnings.concat(utils.formatWarningsIndicadores(await aus.checkIndicadoresGuardado(indicadoresRecalculados)));
    warnings = warnings.concat(utils.formatWarningsSuperposicion(await aus.checkSolapamientoPeriodos(agente, articulo, ausencias.desde, ausencias.hasta)));
    
    ausencias.warnings = warnings;
    
    return ausencias;
}


export async function recalcularAusentismoArticuloActual(ausEnEdicion, agente, articulo, desde, hasta, dias){
    let ausencias = aus.calcularDiasAusencias(agente, articulo, desde, hasta, dias);
    
    let indicadores = await ind.getIndicadoresAusentismo(agente, articulo, ausencias.desde, ausencias.hasta);
    let indicadoresRecalculados = aus.distribuirAusenciasEntreIndicadores(indicadores, ausencias);
    let indicadoresHistoricos = await ind.getIndicadoresHistoricos(agente, articulo, ausEnEdicion.fechaDesde, ausEnEdicion.fechaHasta, ausEnEdicion.cantidadDias);
    let indicadoresFinales = ind.mergeIndicadores(indicadoresRecalculados, indicadoresHistoricos);
    
    let warnings = [];
    warnings = warnings.concat(utils.formatWarningsIndicadores(await aus.checkIndicadoresGuardado(indicadoresFinales)));
    warnings = warnings.concat(utils.formatWarningsSuperposicion(await aus.checkSolapamientoPeriodos(agente, articulo, ausencias.desde, ausencias.hasta, ausEnEdicion)));

    ausencias.warnings = warnings;
    return ausencias;
}

export async function recalcularAusentismoArticuloNuevo(ausEnEdicion, agente, articulo, desde, hasta, dias){
    let ausencias = aus.calcularDiasAusencias(agente, articulo, desde, hasta, dias);
    let indicadores = await ind.getIndicadoresAusentismo(agente, articulo, ausencias.desde, ausencias.hasta);
    let indicadoresRecalculados = aus.distribuirAusenciasEntreIndicadores(indicadores, ausencias);  
    
    let warnings = [];
    warnings = warnings.concat(utils.formatWarningsIndicadores(await aus.checkIndicadoresGuardado(indicadoresRecalculados)));
    warnings = warnings.concat(utils.formatWarningsSuperposicion(await aus.checkSolapamientoPeriodos(agente, articulo, ausencias.desde, ausencias.hasta, ausEnEdicion)));
    
    ausencias.warnings = warnings;
    
    return ausencias;
}