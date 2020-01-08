
import { Types } from 'mongoose';
import * as aus from '../commons/ausentismo';
import * as utils from '../commons/utils';
import { IndicadorAusentismoHistorico } from '../schemas/indicadorhistorico';
import { IndicadorAusentismo } from '../schemas/indicador';
import { calcularDiasAusencias } from '../commons/ausentismo';

class Licencias2Controller {

    agente:any;
    articulo:any;
    fechaDesde:any;
    fechaHasta:any;
    cantidadDias:any;
 
  
    /**
     * Actualiza los datos de un ausentismo por licencia (unicamente).
     * @param ausToUpdate Ausentismo existente a actualizar
     * @param ausNewValues Ausentismo con los nuevos valores a aplicar.
     */
    async updateAusentismo(ausToUpdate, ausNewValues){
        let ausentismo = await this.recalcularAusentismo(ausToUpdate, ausNewValues);
        if (ausentismo.warnings && ausentismo.warnings.length) return ausentismo; // Return ausencias con warnings. No guardamos nada
        // Si llegamos aca, esta todo ok para guardar los cambios
        ausToUpdate.fechaDesde = ausentismo.desde;
        ausToUpdate.fechaHasta = ausentismo.hasta;
        ausToUpdate.cantidadDias = ausentismo.dias;
        ausToUpdate.ausencias = ausentismo.ausencias;
        // observacion: String,
        // adicional: String,
        // extra: String,
        // adjuntos: Array,
        // certificado: CertificadoSchema,
        // ausencias: [AusenciaSchema]
        
        // const ausentismoNew = await aus.insertAusentismo(ausNewValues);
        // await aus.deleteAusentismo(ausToUpdate);
        // await ind.deleteIndicadoresHistoricos(ausToUpdate);
        // await ind.insertIndicadoresHistoricos(ausentismoNew, au.indicadores);
        // await ind.updateIndicadores(au.indicadores);

        let ausUpdated = await ausToUpdate.save();
        // await this.updateIndicadores(ausentismo.indicadores);
        let indicadores:any = this.prepareIndicadores(ausentismo.indicadores);
        await IndicadorAusentismo.bulkWrite(
            indicadores.map((data) => 
                    ({ updateOne: {
                        filter: { _id: Types.ObjectId(data._id)},
                        update: { $set: data }
                    }
                })
            )
        );
        
        return ausUpdated;
    }

    async recalcularAusentismo(ausToUpdate, ausNewValues){
        let ausentismo:any = await this.calcularDiasAusentismo(ausNewValues.agente,ausNewValues.articulo,ausNewValues.fechaDesde,ausNewValues.fechaHasta,ausNewValues.cantidadDias);
        let indicadoresHistoricos = await this.obtenerIndicadoresHistoricos(ausToUpdate);
        let indicadoresActuales = await this.obtenerIndicadoresActuales(ausToUpdate);
        let indicadores = await this.rollbackIndicadoresHistoricos(indicadoresHistoricos, indicadoresActuales);
        let indicadoresRecalculados = await this.actualizarIndicadores(ausNewValues.agente, ausNewValues.articulo, indicadores, ausentismo);
        
        let warnings = [];
        warnings = warnings.concat(utils.formatWarningsIndicadores(await aus.checkIndicadoresGuardado(indicadoresRecalculados)));
        warnings = warnings.concat(utils.formatWarningsSuperposicion(await aus.checkSolapamientoPeriodos(ausNewValues.agente, ausNewValues.articulo, ausentismo.desde, ausentismo.hasta, ausToUpdate)));
    
        ausentismo.warnings = warnings;
        ausentismo.indicadores = indicadoresRecalculados;
        return ausentismo;
    }


    async rollbackIndicadoresHistoricos(indicadoresHistoricos, indicadoresActuales){
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

    async calcularDiasAusentismo(agente, articulo, desde, hasta, dias){
        return await calcularDiasAusencias(agente, articulo, desde, hasta, dias);
    }

    async actualizarIndicadores(agente, articulo, indicadores, diasAusentismo){
        return await this.distribuirAusentismoEntreIndicadores(
                        agente,
                        articulo,
                        indicadores,
                        diasAusentismo
                    );
    }

    async distribuirAusentismoEntreIndicadores(agente, articulo, indicadores, diasAusentismo){
        let totalDiasLicencia = diasAusentismo.dias;
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


    async obtenerIndicadoresHistoricos(ausentismo){
        let indicadores:any = await IndicadorAusentismoHistorico.find({
            'ausentismo.id': Types.ObjectId(ausentismo.id)
        });
        if (!indicadores || !indicadores.length){
            // Se debe tratar de un ausentismo legado sin informacion sobre el
            // periodo que se usufructo la licencia
            indicadores = await this.calcularIndicadoresHistoricos(ausentismo);
        }
        return indicadores;
    }

    async calcularIndicadoresHistoricos(ausentismo){
        let indicadoresHistoricos:any = [];
        let indicadoresActuales:any = await this.obtenerIndicadoresActuales(ausentismo);
        let cantidadDias = ausentismo.cantidadDias;
        for (const indicador of indicadoresActuales) {
            // Vamos a intentar determinar como se pueden distribuir las ausencias
            // ya que no disponemos de informacion historica sobre a que periodo se 
            // asignaron las mismas
            if (cantidadDias > 0 ){
                const licTotales = indicador.intervalos[0].totales;
                const licEjecutadas = indicador.intervalos[0].ejecutadas;
                let pipeline:any = [
                    { $match: { 'indicador.id': Types.ObjectId(indicador._id)}} ,
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
                                "id" : indicador.id
                            },
                            "vigencia" : indicador.vigencia,
                            "ausentismo" : {
                                "id" : ausentismo.id
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
        indicadoresHistoricos.forEach(element => { console.log(element)});
        return indicadoresHistoricos;
    }


    async obtenerIndicadoresActuales(ausentismo){
        console.log("this.obtenerIndicadoresActuales")
        const thisYear = new Date().getFullYear();
        let indicadores = await IndicadorAusentismo.find(
            {
                'agente.id': new Types.ObjectId(ausentismo.agente.id),
                // 'articulo.id': new Types.ObjectId(articulo.id),
                'vigencia': { $gte : thisYear - 3},
                'vencido': false
            }).sort({ vigencia: 1 });
        return indicadores;
    }

    async  obtenerTotalLicenciasDisponibles(agente, articulo){
        console.log("this.obtenerTotalLicenciasDisponibles")
        console.log(agente)
        let pipeline:any = [
            { 
                $match: { 
                    'agente.id': Types.ObjectId(agente.id || agente._id),
                    // 'articulo.id': Types.ObjectId(articulo.id),
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

        console.log("Resultado")
        console.log(resultado)
        return resultado.length? resultado[0].totales - resultado[0].ejecutadas : 0;
    }

    prepareIndicadores(indicadores){
        // Actualizamos los indicadores
        for (const indicador of indicadores){
            for (let intervalo of indicador.intervalos){
                if( intervalo.asignadas){
                    intervalo.ejecutadas = intervalo.ejecutadas + intervalo.asignadas;
                    intervalo.asignadas = 0;
                }
            }
            // await indicador.save()
        }
        return indicadores;
    }
    

}


export default Licencias2Controller;