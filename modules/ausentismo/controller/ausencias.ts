import * as ind from '../commons/indicadores';
import { calcularDiasAusentismo, validateAusentismo, applyChanges } from './ausentismo';
import { AusenciaPeriodo } from '../schemas/ausenciaperiodo';


class AusenciasController {
        
    /**
     * Alta de nuevo ausentismo 
     */
    async addAusentismo(ausNewValues){ 
        let ausentismoNew;
        if (!ausNewValues.ausencias.length){
            let ausentismo:any = await calcularDiasAusentismo(ausNewValues.agente, ausNewValues.articulo, ausNewValues.fechaDesde, ausNewValues.fechaHasta, ausNewValues.cantidadDias);
            ausentismo = {...ausNewValues, ...ausentismo }; // Copiamos los valores del ausentismo calculado
            let indicadores = await this.updateIndicadores(ausentismo);
            let warnings = await validateAusentismo(ausentismo, indicadores);
            if (warnings && warnings.length){
                ausentismo.warnings = warnings;
                return ausentismo;
            }
            ausentismoNew = new AusenciaPeriodo(ausentismo);
        }
        else{
            // Los dias de ausencia ya vienen calculados. No calculamos ausencias ni aplicamos
            // ningun control o restriccion. Especialmente util en la migracion
            ausentismoNew = new AusenciaPeriodo(ausNewValues);    
        }
        return await ausentismoNew.save();
    }

    /**
     * Aplica cambios basicos realizados a un ausentismo por licencia. Si
     * se modificaron las fechas se debe utilizar otro metodo para cambios
     * mas complejos.Esta es una simple optimizacion para evitar recalcular
     * indicadores, etc.
     * @param ausToUpdate 
     * @param ausNewValues 
     */
    async simpleUpdateAusentismo(ausToUpdate, ausNewValues){
        await ausToUpdate.updateOne({ $set: { observacion: ausNewValues.observacion } });
        return ausToUpdate;
    }


    async fullUpdateAusentismo(ausToUpdate, ausNewValues){
        let ausentismo:any = await calcularDiasAusentismo(ausNewValues.agente, ausNewValues.articulo, ausNewValues.fechaDesde, ausNewValues.fechaHasta, ausNewValues.cantidadDias);
        ausNewValues = {...ausNewValues, ...ausentismo} //  Copiamos los valores del ausentismo calculado
        let indicadores = await this.recalcularIndicadores(ausToUpdate, ausNewValues);
        let warnings = await validateAusentismo(ausNewValues, indicadores, ausToUpdate);
        if (warnings && warnings.length){
            // Se identificaron problemas al validar. No se actualiza nada
            ausentismo.warnings = warnings;
            return ausentismo; 
        }
        ausToUpdate = applyChanges(ausToUpdate, ausNewValues);
        let ausUpdated = await ausToUpdate.save();
        return ausUpdated; 
    }

    async deleteAusentismo(ausToDelete){
        return await ausToDelete.remove();
    }

 
    async recalcularIndicadores(ausToUpdate, ausNewValues){
        // Indicadores son los indicadores sin los cambios aplicados
        // por los dias del ausentismo que se esta actualizando
        let indicadores = await this.rollbackIndicadores(ausToUpdate);
        return await this.distribuirAusentismoEntreIndicadores(indicadores, ausNewValues);
    }

    async rollbackIndicadores(ausToUpdate){
        let indicadores = await ind.obtenerIndicadores(ausToUpdate);
        let indicadoresRecalculados = await this.distribuirAusentismoEntreIndicadores(indicadores, ausToUpdate);
        for (let indicador of indicadoresRecalculados){
            for (let intervalo of indicador.intervalos){
                intervalo.ejecutadas = intervalo.ejecutadas - intervalo.asignadas;
                intervalo.asignadas = 0;
            }
        }
        return indicadoresRecalculados;
    }

    
    async updateIndicadores(ausentismo){
        let indicadoresActuales = await ind.obtenerIndicadores(ausentismo);
        let indicadoresRecalculados = await this.distribuirAusentismoEntreIndicadores(indicadoresActuales, ausentismo);
        return indicadoresRecalculados;
    }



    /**
     * "Distribuye" cada uno de los dias calculados del ausentismo entre los intervalos del
     * periodo de los indicadores. 
     * De esta forma se determina finalmente cuantos dias se van a asignar a cada intervalo
     * del periodo. 
     * @param indicadores 
     * @param ausentismo 
     */
    distribuirAusentismoEntreIndicadores(indicadores, ausentismo){
        for (let indicador of indicadores){
            for (let intervalo of indicador.intervalos){
                intervalo.asignadas = 0; // Inicializamos en 0 el contador
                if ( !indicador.periodo || 
                    (intervalo.desde <= ausentismo.fechaDesde && 
                    intervalo.hasta >= ausentismo.fechaHasta)){
                    // Asignamos el total de dias de ausencias al intervalo
                    intervalo.asignadas = ausentismo.cantidadDias;
                }
                else{
                    for (let ausencia of ausentismo.ausencias){
                        let dia = ausencia.fecha;
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
}

export default AusenciasController;