import * as aus from '../commons/ausentismo';
import * as utils from '../commons/utils';
import * as ind from '../commons/indicadores';


class LicenciasController {

    agente:any;
    articulo:any;
    fechaDesde:any;
    fechaHasta:any;
    cantidadDias:any;


    /**
     * 
     * @param ausentismo nuevo ausentismo a guardar
     */
    async addAusentismo(ausentismo){
        let au = await this.calcularAusentismo(ausentismo.agente, ausentismo.articulo,
            ausentismo.fechaDesde, ausentismo.fechaHasta, ausentismo.cantidadDias);

        if (au.warnings && au.warnings.length){
            return au;
        }
        else{
            // Generamos el nuevo ausentismo y actualizamos indicadores
            ausentismo.ausencias = aus.generarDiasAusencia(ausentismo, au.ausencias)
            const ausentismoNew = await aus.insertAusentismo(ausentismo);
            await ind.insertIndicadoresHistoricos(ausentismoNew, au.indicadores);
            await ind.updateIndicadores(au.indicadores);
            return ausentismoNew;
        }
    }

    /**
     * Verifica si se modifico el articulo en la edicion y delega la actualizacion
     * segun corresponda
     * @param ausToUpdate 
     * @param ausNewValues 
     */
    async updateAusentismo(ausToUpdate, ausNewValues){
        if(ausNewValues.articulo.descuentaDiasLicencia ||
            (ausToUpdate.articulo.id == ausNewValues.articulo.id)){
            return await this.updateAusentismoSameArticulo(ausToUpdate, ausNewValues);
        }
        else {
            return await this.updateAusentismoChangeArticulo(ausToUpdate, ausNewValues);
        }
    }

    async updateAusentismoSameArticulo(ausToUpdate, ausNewValues){
        let au = await this.recalcularAusentismoArticuloActual(ausToUpdate, 
                ausNewValues.agente,ausNewValues.articulo, ausNewValues.fechaDesde,
                ausNewValues.fechaHasta, ausNewValues.cantidadDias)
        
        if (au.warnings && au.warnings.length) return au; // Return ausencias con warnings. No guardamos nada
        
        // Si llegamos aca, esta todo ok para guardar los cambios  
        ausNewValues.ausencias = aus.generarDiasAusencia(ausNewValues, au.ausencias)
        const ausentismoNew = await aus.insertAusentismo(ausNewValues);
        await aus.deleteAusentismo(ausToUpdate);
        await ind.deleteIndicadoresHistoricos(ausToUpdate);
        await ind.insertIndicadoresHistoricos(ausentismoNew, au.indicadores);
        await ind.updateIndicadores(au.indicadores);
        return ausentismoNew;
    }

    async updateAusentismoChangeArticulo(ausToUpdate, ausNewValues){
        let au = await this.recalcularAusentismoArticuloNuevo(ausToUpdate, ausNewValues.agente,
            ausNewValues.articulo, ausNewValues.fechaDesde, ausNewValues.fechaHasta, ausNewValues.cantidadDias);
        
        if (au.warnings && au.warnings.length) return au;// Return ausencias con warnings. No guardamos nada
            
        // Si llegamos aca, esta todo ok para guardar los cambios
        ausNewValues.ausencias = aus.generarDiasAusencia(ausNewValues, au.ausencias);
        const ausentismoNew = await aus.insertAusentismo(ausNewValues);
        await aus.deleteAusentismo(ausToUpdate);
        await ind.updateIndicadoresOnDelete(ausToUpdate)
        await ind.deleteIndicadoresHistoricos(ausToUpdate);
        return ausentismoNew;  
    }

    async sugerirAusentismo(agente, articulo, desde){
        let indicadores = await ind.getIndicadoresLicencia(agente, articulo, desde);
        let totalDiasDisponibles = await ind.getTotalLicenciasDisponibles(agente, articulo);
        let ausencias = await aus.calcularDiasAusencias(agente, articulo, desde, null, totalDiasDisponibles);
        
        let warnings = [];
        warnings = warnings.concat(utils.formatWarningsIndicadores(await aus.checkIndicadoresSugerencia(indicadores, desde)));
        warnings = warnings.concat(utils.formatWarningsSuperposicion(await aus.checkSolapamientoPeriodos(agente, articulo, ausencias.desde, ausencias.hasta)));

        ausencias.warnings = warnings;
        return ausencias;
    }

    async calcularAusentismo(agente, articulo, desde, hasta, dias){
        let ausencias = aus.calcularDiasAusencias(agente, articulo, desde, hasta, dias);
        let indicadores = await ind.getIndicadoresLicencia(agente, articulo, ausencias.desde, ausencias.hasta);
        let indicadoresRecalculados = await aus.distribuirLicenciasEntreIndicadores(agente, articulo, indicadores, ausencias);  
    
        let warnings = [];
        warnings = warnings.concat(utils.formatWarningsIndicadores(await aus.checkIndicadoresGuardado(indicadoresRecalculados)));
        warnings = warnings.concat(utils.formatWarningsSuperposicion(await aus.checkSolapamientoPeriodos(agente, articulo, ausencias.desde, ausencias.hasta)));
        
        ausencias.warnings = warnings;
        ausencias.indicadores = indicadoresRecalculados;
        return ausencias;
    }
    
    
    async recalcularAusentismoArticuloActual(licEnEdicion, agente, articulo, desde, hasta, dias){
        let ausencias = aus.calcularDiasAusencias(agente, articulo, desde, hasta, dias);
        
        let indicadoresActuales = await ind.getIndicadoresLicencia(agente, articulo, ausencias.desde, ausencias.hasta);
        let indicadoresHistoricos = await ind.getIndicadoresLicenciaHistoricos(licEnEdicion);
        let indicadoresCorregidos = ind.mergeIndicadores(indicadoresActuales, indicadoresHistoricos);
        let indicadoresRecalculados = await aus.distribuirLicenciasEntreIndicadores(agente, articulo, indicadoresCorregidos, ausencias);  
    
        let warnings = [];
        warnings = warnings.concat(utils.formatWarningsIndicadores(await aus.checkIndicadoresGuardado(indicadoresRecalculados)));
        warnings = warnings.concat(utils.formatWarningsSuperposicion(await aus.checkSolapamientoPeriodos(agente, articulo, ausencias.desde, ausencias.hasta, licEnEdicion)));
        
        ausencias.warnings = warnings;
        ausencias.indicadores = indicadoresRecalculados;
        return ausencias;
    }
    
    async recalcularAusentismoArticuloNuevo(licEnEdicion, agente, articulo, desde, hasta, dias){
        let ausencias = aus.calcularDiasAusencias(agente, articulo, desde, hasta, dias);
        let indicadores = await ind.getIndicadoresAusentismo(agente, articulo, ausencias.desde, ausencias.hasta);
        let indicadoresRecalculados = await aus.distribuirAusenciasEntreIndicadores(indicadores, ausencias);  
        
        let warnings = [];
        warnings = warnings.concat(utils.formatWarningsIndicadores(await aus.checkIndicadoresGuardado(indicadoresRecalculados)));
        warnings = warnings.concat(utils.formatWarningsSuperposicion(await aus.checkSolapamientoPeriodos(agente, articulo, ausencias.desde, ausencias.hasta, licEnEdicion)));
        
        ausencias.warnings = warnings;
        
        return ausencias;
    }
}
export default LicenciasController;

