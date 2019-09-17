import * as utils from '../commons/utils';
import * as aus from '../commons/ausentismo';
import * as ind from '../commons/indicadores';
import LicenciasController from './licencias';
import { changeFileObjectRef } from '../../../core/files/controller/file';

class AusenciasController {
    
    async addAusentismo(ausentismo){
        if (!ausentismo.ausencias.length){
            let au = await calcularAusentismo(ausentismo.agente, ausentismo.articulo,
                ausentismo.fechaDesde, ausentismo.fechaHasta, ausentismo.cantidadDias);
            if (au.warnings && au.warnings.length)
                return au;
            ausentismo.ausencias = aus.generarDiasAusencia(ausentismo, au.ausencias);
        }
        else{
            // Los dias de ausencia ya vienen calculados. No calculamos ausencias ni aplicamos
            // ningun control o restriccion.
        }
        return await aus.insertAusentismo(ausentismo);
        

        // if (ausencias.warnings && ausencias.warnings.length){
        //     return ausencias;
        // }
        // else{
        //     return await aus.insertAusentismo(ausentismo, ausencias);
        // }
    }

       /**
     * Verifica si se modifico el articulo en la edicion y delega la actualizacion
     * segun corresponda
     * @param ausToUpdate 
     * @param ausNewValues 
     */
    async updateAusentismo(ausToUpdate, ausNewValues){
        let ausUpdated;
        if(!ausNewValues.articulo.descuentaDiasLicencia){
            ausUpdated = await this.updateAusentismoToAusentismo(ausToUpdate, ausNewValues);
        }
        else {
            ausUpdated = await this.updateAusentismoToLicencia(ausToUpdate, ausNewValues);
        }
        if (ausUpdated.warnings && ausUpdated.warnings.length){
            // Return ausencias con warnings. No guardamos nada
            return ausUpdated;    
        }
        // Actualizamos finalmente cualquier referencia a archivos adjuntos
        changeFileObjectRef(ausToUpdate._id, ausUpdated._id);
        return ausUpdated;
    }

    async updateAusentismoToAusentismo(ausToUpdate, ausNewValues){
        let au:any;
        if (ausToUpdate.articulo.id == ausNewValues.articulo.id){
            au = await recalcularAusentismoArticuloActual(ausToUpdate, ausNewValues.agente,
                    ausNewValues.articulo, ausNewValues.fechaDesde, ausNewValues.fechaHasta, ausNewValues.cantidadDias)
        }
        else{
            au = await recalcularAusentismoArticuloNuevo(ausToUpdate, ausNewValues.agente,
                    ausNewValues.articulo, ausNewValues.fechaDesde, ausNewValues.fechaHasta, ausNewValues.cantidadDias)
        }

        if (au.warnings && au.warnings.length){
            // Return ausencias con warnings. No guardamos nada
            return au;    
        }
        else{
            // Todo esta ok, se procede a guardar los cambios
            ausNewValues.ausencias = aus.generarDiasAusencia(ausNewValues, au.ausencias)                           
            await aus.deleteAusentismo(ausToUpdate);
            return await aus.insertAusentismo(ausNewValues);
        }
    }

    async updateAusentismoToLicencia(ausToUpdate, ausNewValues){
        let licController = new LicenciasController();
        let au = await licController.recalcularAusentismoArticuloActual(ausToUpdate,ausNewValues.agente,ausNewValues.articulo,
            ausNewValues.fechaDesde, ausNewValues.fechaHasta, ausNewValues.cantidadDias)

        if (au.warnings && au.warnings.length){
            // Return ausencias con warnings. No guardamos nada
            return au;    
        }
        else{
            // Todo esta ok, se procede a guardar los cambios
            // TODO Update fileinfo
            ausNewValues.ausencias = aus.generarDiasAusencia(ausNewValues, au);                          
            let ausentismoNew = await aus.insertAusentismo(ausNewValues);
            await aus.deleteAusentismo(ausToUpdate);
            await ind.insertIndicadoresHistoricos(ausentismoNew, au.indicadores);
            await ind.updateIndicadores(au.indicadores);
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
    let ausencias = await aus.calcularDiasAusencias(agente, articulo, desde, hasta, dias);
    let indicadores = await ind.getIndicadoresAusentismo(agente, articulo, ausencias.desde, ausencias.hasta);
    let indicadoresRecalculados = aus.distribuirAusenciasEntreIndicadores(indicadores, ausencias);  

    let warnings = [];
    warnings = warnings.concat(utils.formatWarningsIndicadores(await aus.checkIndicadoresGuardado(indicadoresRecalculados)));
    warnings = warnings.concat(utils.formatWarningsSuperposicion(await aus.checkSolapamientoPeriodos(agente, articulo, ausencias.desde, ausencias.hasta)));
    
    ausencias.warnings = warnings;
    
    return ausencias;
}


export async function recalcularAusentismoArticuloActual(ausEnEdicion, agente, articulo, desde, hasta, dias){
    let ausencias = await aus.calcularDiasAusencias(agente, articulo, desde, hasta, dias);
    
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
    let ausencias = await aus.calcularDiasAusencias(agente, articulo, desde, hasta, dias);
    let indicadores = await ind.getIndicadoresAusentismo(agente, articulo, ausencias.desde, ausencias.hasta);
    let indicadoresRecalculados = aus.distribuirAusenciasEntreIndicadores(indicadores, ausencias);  
    
    let warnings = [];
    warnings = warnings.concat(utils.formatWarningsIndicadores(await aus.checkIndicadoresGuardado(indicadoresRecalculados)));
    warnings = warnings.concat(utils.formatWarningsSuperposicion(await aus.checkSolapamientoPeriodos(agente, articulo, ausencias.desde, ausencias.hasta, ausEnEdicion)));
    
    ausencias.warnings = warnings;
    
    return ausencias;
}