
import { Types } from 'mongoose';
import { IndicadorAusentismoHistorico } from '../schemas/indicadorhistorico';
import { IndicadorAusentismo } from '../schemas/indicador';
import { AusenciaPeriodo } from '../schemas/ausenciaperiodo';

import { calcularDiasAusentismo, validateAusentismo, validateAusentismoSugerencia, applyChanges } from './ausentismo';
import { getIndicadoresLicencia } from '../commons/indicadores';

class LicenciasController {

    /**
     * Alta de un nuevo ausentismo por licencia. Adicionalmente actualiza
     * los indicadores y crea indicadores historicos de referencias (para
     * futura edicion/eliminacion)
     * @param ausentismo nuevo ausentismo de tipo "licencia" a guardar
     */
    async addAusentismo(ausNewValues){ 
        if (!ausNewValues.ausencias.length){
            let ausentismo:any = await calcularDiasAusentismo(ausNewValues.agente, ausNewValues.articulo, ausNewValues.fechaDesde, ausNewValues.fechaHasta, ausNewValues.cantidadDias);
            ausentismo = {...ausNewValues, ...ausentismo }; // Copiamos los valores del ausentismo calculado
            let indicadores = await this.calcularIndicadores(ausentismo);
            let warnings = await validateAusentismo(ausentismo, indicadores);
            if (warnings && warnings.length){
                ausentismo.warnings = warnings;
                return ausentismo; 
            }
            let ausentismoNew = new AusenciaPeriodo(ausentismo);
            ausentismoNew = await ausentismoNew.save();
            await this.insertIndicadoresHistoricos(ausentismoNew, indicadores);
            await this.saveIndicadores(indicadores);
            return ausentismoNew;
        }
        else {
            // Los dias de ausencia ya vienen calculados. No calculamos ausencias ni aplicamos
            // ningun control o restriccion.
            const ausentismoNew = new AusenciaPeriodo(ausNewValues);
            return await ausentismoNew.save();
        }
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

    /**
     * Aplica los cambios realizados a una licencia existente. Para esto se
     * recalculan los dias de licencias e indicadores de acuerdo a los nuevos
     * valores ingresados, y se realizan las validaciones correspondientes.
     * @param ausToUpdate Ausentismo existente a actualizar
     * @param ausNewValues Ausentismo con los nuevos valores a aplicar.
     */
    async fullUpdateAusentismo(ausToUpdate, ausNewValues){
        let ausentismo:any = await calcularDiasAusentismo(ausNewValues.agente,ausNewValues.articulo,ausNewValues.fechaDesde,ausNewValues.fechaHasta,ausNewValues.cantidadDias);
        ausNewValues = {...ausNewValues, ...ausentismo} //  Copiamos los valores del ausentismo calculado
        let indicadores = await this.recalcularIndicadores(ausToUpdate, ausNewValues.cantidadDias);
        let warnings = await validateAusentismo(ausNewValues, indicadores, ausToUpdate);
        if (warnings && warnings.length){
            // Se identificaron problemas al validar. No se actualiza nada
            ausentismo.warnings = warnings;
            return ausentismo; 
        } 
        ausToUpdate = applyChanges(ausToUpdate, ausNewValues);
        let ausUpdated = await ausToUpdate.save();
        await this.updateIndicadoresHistoricos(ausToUpdate, indicadores)
        await this.saveIndicadores(indicadores);
        return ausUpdated;
    }

    async deleteAusentismo(ausToDelete){
        let indicadores = await this.recalcularIndicadores(ausToDelete, 0);
        await this.saveIndicadores(indicadores);
        await this.deleteIndicadoresHistoricos(ausToDelete);
        return await ausToDelete.remove();
    }
    


    async sugerirAusentismo(ausNewValues){
        let indicadores = await this.obtenerIndicadoresActuales(ausNewValues);
        let totalDiasDisponibles = await this.obtenerTotalLicenciasDisponibles(ausNewValues);
        let ausentismo = await calcularDiasAusentismo(ausNewValues.agente, ausNewValues.articulo, ausNewValues.desde, null, totalDiasDisponibles);
        let warnings = await validateAusentismoSugerencia(ausNewValues, ausentismo, indicadores);

        // let warnings = [];
        // warnings = warnings.concat(utils.formatWarningsIndicadores(await aus.checkIndicadoresSugerencia(indicadores, desde)));
        // warnings = warnings.concat(utils.formatWarningsSuperposicion(await aus.checkSolapamientoPeriodos(agente, articulo, ausencias.desde, ausencias.hasta)));
        if (warnings && warnings.length){
            
        }
        // ausentismo.warnings = warnings; // TODO Corregir Esto
        return ausentismo; 
        
    }


    /**
     * Utilizado en la edicion/eliminacion de una licencia. Basicamente es un
     * esfuerzo por actualizar los indicadores existentes removiendo los dias
     * previos asignados y aplicando los nuevos dias indicados.
     * @param ausToUpdate 
     * @param ausNewValues 
     * @param ausCalculado
     * @usedby fullUpdateAusentismo(), deleteAusentismo()
     */
    async recalcularIndicadores(ausToUpdate, diasLicencia:Number){
        let indicadoresHistoricos = await this.obtenerIndicadoresHistoricos(ausToUpdate);
        let indicadoresActuales = await this.obtenerIndicadoresActuales(ausToUpdate);
        let indicadores = await this.rollbackIndicadores(indicadoresHistoricos, indicadoresActuales);
        let indicadoresRecalculados = await this.distribuirAusentismoEntreIndicadores(indicadores, diasLicencia);
        return indicadoresRecalculados;
    }

    /**
     * Calcula los nuevos valores de los indicadores existentes a partir de los
     * nuevos dias de licencia indicados en el ausentismo
     * @param ausentismo 
     * @usedby addAusentismo()
     */
    async calcularIndicadores(ausentismo){
        let indicadoresActuales = await this.obtenerIndicadoresActuales(ausentismo);
        let indicadoresRecalculados = await this.distribuirAusentismoEntreIndicadores(indicadoresActuales, ausentismo.cantidadDias);
        return indicadoresRecalculados;
    }



    /** 
     * Dado un conjunto de indicadores historicos (perteneciente a una licencia
     * previamente tomada) se intentara dejar los indicadores actuales al estado
     * previo de tomarse la licencia.
     * @param indicadoresHistoricos 
     * @param indicadoresActuales
     * @usedby recalcularIndicadores
     */
    async rollbackIndicadores(indicadoresHistoricos, indicadoresActuales){
        for (let indNuevo of indicadoresActuales){
            for (let intervalo of indNuevo.intervalos){
                const intEncontrado = this.findIntervalo(intervalo, indNuevo, indicadoresHistoricos);
                if (intEncontrado){
                    intervalo.ejecutadas = intervalo.ejecutadas - intEncontrado.asignadas;
                }
            }
        }
        return indicadoresActuales;
    }
    
    /**
     * Utilidad para encontrar un intervalo perteneciente a un indicador
     * dentro de otro indicador
     * @param intervalo 
     * @param indicadorNuevo 
     * @param indicadoresPrevios 
     */
    findIntervalo(intervalo, indicadorNuevo, indicadoresPrevios){
        let intervaloEncontrado;
        for (const indicador of indicadoresPrevios){
            if (indicadorNuevo.vigencia ==  indicador.vigencia){
                for (const int of indicador.intervalos){
                    if ((!int.desde && !intervalo.desde && !int.hasta && !intervalo.hasta) ||
                        (int.desde.getTime() == intervalo.desde.getTime() &&
                        int.hasta.getTime() == intervalo.hasta.getTime())){
                            intervaloEncontrado = int;
                            break;
                        }
                }
            }
            if (intervaloEncontrado) break;
        }   
        return intervaloEncontrado;
    }

    

    /**
     * Metodo que asigna/distribuye los dias de licencias a tomar entre los dias 
     * disponibles por periodo (indicadores). Recordar que un indicador informa
     * el periodo de vigencia y los dias totales disponibles y los dias ya asig-
     * nados.
     * 
     * @param indicadores 
     * @param diasLicencia total dias de licencia a asignar
     */
    async distribuirAusentismoEntreIndicadores(indicadores, diasLicencia){
        let totalDiasLicencia = diasLicencia;
        let intervaloEnAnalisis:any;
        for (let indicador of indicadores){         
            for (const intervalo of indicador.intervalos){
                intervaloEnAnalisis = intervalo;
                if (intervalo.totales){
                    const diasDisponibles = intervalo.totales - intervalo.ejecutadas;
                    if ( diasDisponibles ==  0 ) break;
                    if ( diasDisponibles <=  totalDiasLicencia ){
                        totalDiasLicencia = totalDiasLicencia - diasDisponibles;
                        intervalo.asignadas = diasDisponibles;
                    }
                    else{
                        intervalo.asignadas = totalDiasLicencia;
                        totalDiasLicencia = 0;
                    }
                }
                else{ 
                    // No habria limite de licencias. Asignamos todos los dias a este intervalo
                    // TODO Revisar si efectivamente asi deberia ser el comportamiento correcto
                    intervalo.asignadas = totalDiasLicencia;
                }
                
            }
        } 
        if ( totalDiasLicencia > 0){
            // Quedaron dias de licencia sin poder asignar a ningun intervalo
            // Forzamos que el numero de licencias asignadas sea superior al disponible
            if (intervaloEnAnalisis) intervaloEnAnalisis.asignadas = intervaloEnAnalisis.asignadas + totalDiasLicencia; 
        }   
    
        return indicadores;
    }


    /**
     * Recupera los indicadores(historicos) al momento en que se aplicaron
     * los cambios. Este dato no siempre estara disponible debido a que las
     * licencias previas legadas del sistema anterior no disponen de esta
     * informacion (es decir que no es posible saber con precision a que
     * periodo se usufructuo), por lo tanto ante estos casos se "calcularan"
     * los indicadores historicos. Idealmente quizas deba ser el usuario 
     * quien manualmente indique a que periodo pertenecio cada licencia que
     * se tomo en el pasado. De esta forma el usuario tendria mas control
     * sobre el proceso.
     * @param ausentismo 
     */
    async obtenerIndicadoresHistoricos(ausentismo){
        let indicadores:any = await IndicadorAusentismoHistorico.find({
            'ausentismo._id': Types.ObjectId(ausentismo._id)
        });
        if (!indicadores || !indicadores.length){
            // Se debe tratar de un ausentismo legado sin informacion sobre el
            // periodo que se usufructo la licencia
            indicadores = await this.calcularIndicadoresHistoricos(ausentismo);
        }
        return indicadores;
    }

    /**
     * @usedby obtenerIndicadoresHistoricos()
     * @param ausentismo 
     */
    async calcularIndicadoresHistoricos(ausentismo){
        let indicadoresHistoricos:any = [];
        let indicadoresActuales:any = await this.obtenerIndicadoresActuales(ausentismo);
        let cantidadDias = ausentismo.cantidadDias;
        for (const indicador of indicadoresActuales) {
            // Vamos a intentar determinar/inferir el indicador historico
            if (cantidadDias > 0 ){
                const licTotales = indicador.intervalos[0].totales;
                const licEjecutadas = indicador.intervalos[0].ejecutadas;
                let pipeline:any = [
                    { $match: { 'indicador._id': Types.ObjectId(indicador._id)}} ,
                    { $unwind: '$intervalos'},
                    { $group: { _id:null, total_asignadas: { $sum: "$intervalos.asignadas" }}}
                ]
                let resultadoQuery = await IndicadorAusentismoHistorico.aggregate(pipeline)
                let licAsignadas = resultadoQuery.length? resultadoQuery[0].total_asignadas : 0;
                // licDisponibles seria el nro de licencias que se podrian considerar
                // para "proponer" como historicas
                let licDisponibles = licEjecutadas - licAsignadas; 
                if ( licDisponibles > 0){
                    let licReasignadas = 0;
                    if (cantidadDias <= licDisponibles) {
                        licReasignadas = cantidadDias;
                        cantidadDias = 0;
                    }
                    else{
                        licReasignadas = licDisponibles;
                        cantidadDias = cantidadDias -  licDisponibles;
                    }
                    let indicadorHistorico = 
                        {
                            "indicador" : {
                                "_id" : indicador._id
                            },
                            "vigencia" : indicador.vigencia,
                            "ausentismo" : {
                                "_id" : ausentismo._id
                            },
                            "intervalos" : [ 
                                {
                                    "totales" : licTotales,
                                    "ejecutadas" : licEjecutadas - licReasignadas,
                                    "asignadas" : licReasignadas
                                }
                            ]
                        }
                    indicadoresHistoricos.push(indicadorHistorico);
                }    
            }
        }
        return indicadoresHistoricos;
    }


    async obtenerIndicadoresActuales(ausentismo){
        return await getIndicadoresLicencia(ausentismo.agente);
    }


    async obtenerTotalLicenciasDisponibles(ausentismo){
        let pipeline:any = [
            { 
                $match: { 
                    'agente._id': Types.ObjectId(ausentismo.agente._id),
                    'vencido': false
                }
            } ,
            {
                $unwind: '$intervalos'
            },
            {
                $group: {
                    _id : null,
                    totales : { $sum: '$intervalos.totales'},
                    ejecutadas : { $sum: '$intervalos.ejecutadas'}
                }
            }
         ]
        
        let resultado = await IndicadorAusentismo.aggregate(pipeline);
        return resultado.length? resultado[0].totales - resultado[0].ejecutadas : 0;
    }


    async saveIndicadores(indicadores){
        for (const indicador of indicadores){
            for (let intervalo of indicador.intervalos){
                if( intervalo.asignadas){
                    intervalo.ejecutadas = intervalo.ejecutadas + intervalo.asignadas;
                    intervalo.asignadas = 0;
                }
            }
           await indicador.save()
        }
        return indicadores;
    }

    async updateIndicadoresHistoricos(ausToUpdate, indicadores){
        await this.deleteIndicadoresHistoricos(ausToUpdate);
        await this.insertIndicadoresHistoricos(ausToUpdate, indicadores);
    }

    async deleteIndicadoresHistoricos(ausentismo){
        await IndicadorAusentismoHistorico.deleteMany({
                'ausentismo._id': Types.ObjectId(ausentismo._id)
        });
    }
    
    async insertIndicadoresHistoricos(ausentismo, indicadores){
        let timestamp = new Date().getTime();
        for (const indicador of indicadores){
            let intervalosH = [];
            for (const int of indicador.intervalos){
                if (int.asignadas > 0){
                    // Solo interesa guardar el historico de los indicadores
                    // que modificaron los dias asignados
                    let intHistorico = {
                        desde: int.desde,
                        hasta: int.hasta,
                        totales: int.totales,
                        ejecutadas: int.ejecutadas,
                        asignadas: int.asignadas
                    }
                    intervalosH.push(intHistorico)
                }
                
            }
            if (intervalosH.length){
                let indicadorHistorico = new IndicadorAusentismoHistorico({
                    timestamp: timestamp,
                    indicador: { _id: Types.ObjectId(indicador._id)},
                    vigencia: indicador.vigencia,
                    ausentismo: { _id: Types.ObjectId(ausentismo._id)},
                    intervalos: intervalosH
                });
                await indicadorHistorico.save();
            }
        }
        return;
    }
}


export default LicenciasController;