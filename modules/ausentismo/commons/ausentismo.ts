// import { Ausencia } from '../schemas/ausencia';
// import { AusenciaPeriodo } from '../schemas/ausenciaperiodo';

// import * as utils from './utils';

// export interface IDiasAusencia {
//     fechaDesde: Date,
//     fechaHasta: Date,
//     cantidadDias: Number,
//     ausencias?: any[],
// }


// /**
//  * Determina con precision la fecha desde, hasta, total de dias y las fechas
//  * de los dias de ausencia, de acuerdo al tipo de dia indicado por el articulo
//  * (dias corridos o habiles).
//  * @param agente  
//  * @param articulo Determina si se deben calcular dias corridos o habiles
//  * @param desde 
//  * @param hasta Opcional. Si se indica este valor se intenta determinar el total de dias
//  * @param dias Opcional. Si se indica este valor se intenta determinar la fecha hasta
//  * @returns [Promise<IDiasAusencia>]
//  */
// export async function calcularDiasAusenciasDeprecated(agente, articulo, desde, hasta?, dias?):Promise<IDiasAusencia>{
//     let diasAusencias: IDiasAusencia;
//     if ((!articulo.diasCorridos && !articulo.diaHabiles) || articulo.diasCorridos){
//         diasAusencias = calculaDiasCorridos(desde, hasta, dias);
//     }

//     if (articulo.diasHabiles){
//         diasAusencias = await calculaDiasHabiles(agente, desde, hasta, dias);
//     }
//     diasAusencias.ausencias = generarAusencias(agente, articulo, diasAusencias.ausencias);
//     return diasAusencias;
// }


// export function calculaDiasCorridos(desde:Date, hasta?:Date, dias?:number){
//     let ausencias = [];
//     let totalDias = 0;
//     if (hasta && !dias){
//         let fechaAusencia = desde;
//         while(fechaAusencia <= hasta){
//             totalDias = totalDias + 1;
//             ausencias.push(new Date(fechaAusencia));
//             fechaAusencia = utils.addOneDay(fechaAusencia);
//         }
//     }
//     if (dias){ // Si tiene fecha hasta igualmente toma precedencia la cantidad de dias
//         let fechaAusencia = desde;
//         for (let i = 0; i < dias ; i++) {
//             hasta = fechaAusencia;
//             ausencias.push(new Date(fechaAusencia));
//             fechaAusencia = utils.addOneDay(fechaAusencia);    
//         }
//         totalDias = dias;
//     }
//     return {
//         fechaDesde: desde,
//         fechaHasta: hasta,
//         cantidadDias: totalDias,
//         ausencias: ausencias
//     }
// }


// export async function calculaDiasHabiles(agente, desde:Date, hasta?:Date, dias?):Promise<IDiasAusencia>
// {
//     let ausencias = [];
//     let totalDias = 0;
//     if (hasta && !dias){
//         let fechaAusencia = desde;
//         while(fechaAusencia <= hasta){
//             if (await utils.esDiaHabil(agente, fechaAusencia)){
//                 totalDias = totalDias + 1;
//                 ausencias.push(new Date(fechaAusencia));
//             }
//             fechaAusencia = utils.addOneDay(fechaAusencia);
//         }
//     }
//     if (dias){ // Si tiene fecha hasta igualmente toma precedencia la cantidad de dias
//         let fechaAusencia = desde;
//         let i = 0;
//         while (i < dias){
//             let esDiaHabil = await utils.esDiaHabil(agente, fechaAusencia)
//             while (!esDiaHabil){
//                 fechaAusencia = utils.addOneDay(fechaAusencia);    
//                 esDiaHabil = await utils.esDiaHabil(agente, fechaAusencia)
//             }        
//             hasta = fechaAusencia;
//             ausencias.push(new Date(fechaAusencia));
//             i = i + 1;
//             fechaAusencia = utils.addOneDay(fechaAusencia);    
//         }
//         totalDias = dias;
//     }
//     return {
//         fechaDesde: desde,
//         fechaHasta: hasta,
//         cantidadDias: totalDias,
//         ausencias: ausencias
//     }
// }


// /**
//  * "Distribuye" cada uno de los dias calculados del ausentismo entre los intervalos del
//  * periodo de los indicadores. 
//  * De esta forma se determina finalmente cuantos dias se van a asignar a cada intervalo
//  * del periodo. Por ejemplo si tengo 2 indicadores. Uno con un periodo anual y otro con
//  * un periodo mensual, y un ausentismo cargado con fecha desde 30/3, fecha hasta 02/04 y
//  * un cantidad de 4 dias de ausencias, entonces se retornaran dos indicadores con la info
//  * siguiente:
//  *            * Un indicador anual, con un intervalo, y 4 dias asignados en ese intervalo
//  *            * Un indicador mensual, con dos intervalos con fechas:
//  *                  * 01/03 al 31/03 con 2 dias asignados en ese intervalo
//  *                  * 01/04 al 30/04 con 2 dias asignados en ese intervalo
//  * @param indicadores 
//  * @param ausentismo 
//  */
// export function distribuirAusenciasEntreIndicadores(indicadores, ausentismo){
//     let indicadoresFiltrados = [];
//     for (let indicador of indicadores){
//         indicadoresFiltrados.push(minimizarIntervalosIndicador(indicador, ausentismo.desde, ausentismo.hasta));
//     }
//     indicadores = indicadoresFiltrados;
//     for (let indicador of indicadores){
//         for (let intervalo of indicador.intervalos){
//             intervalo.asignadas = 0; // Inicializamos en 0 el contador
//             if ( !indicador.periodo || 
//                 (intervalo.desde <= ausentismo.desde && 
//                 intervalo.hasta >= ausentismo.hasta)){
//                 // Asignamos el total de dias de ausencias al intervalo
//                 intervalo.asignadas = ausentismo.dias;
//             }
//             else{
//                 for (let ausencia of ausentismo.ausencias){
//                     // console.log('Vamos a imprimir el dia!!')
//                     // console.log(dia)
//                     // console.log(intervalo.desde)
//                     let dia = ausencia.fecha;
//                     if ( intervalo.desde <= dia && intervalo.hasta >= dia){
//                         intervalo.asignadas = intervalo.asignadas + 1;
//                     }
//                     if (intervalo.hasta < dia) break;
//                 }
//             }
//         }
//     }
//     return indicadores;
// }

// /**
//  * Utilidad para reducir el nro de intervalos a analizar dentro de un indicador
//  * Retorna el mismo indicador con solo los intervalos de interes, que son aquellos
//  * comprendidos dentro del periodo desde y hasta
//  * @param indicador 
//  * @param desde 
//  * @param hasta 
//  */
// export function minimizarIntervalosIndicador(indicador, desde, hasta){
//     let filteredIntervalos = [];
//     if (indicador.periodo){
//         let cotaInferior = false;
//         for( let intervalo of indicador.intervalos ) {
//             if ( !cotaInferior){
//                 if (intervalo.hasta >= desde) {
//                     filteredIntervalos.push(intervalo);
//                     cotaInferior = true;
//                 }
//             }
//             else{
//                 if (intervalo.desde > hasta) break;
//                 filteredIntervalos.push(intervalo);
//             }
//         }
//         indicador.intervalos = filteredIntervalos;
//     }
//     return indicador;
// }


// // TODO. Revisar si esta deprecated
// // export async function distribuirLicenciasEntreIndicadores(agente, articulo, indicadores, ausencias){
// //     let totalDiasLicencia = ausencias.dias;
// //     let totalDiasDisponibles = await ind.getTotalLicenciasDisponibles(agente, articulo);
// //     if (totalDiasDisponibles && (totalDiasDisponibles < totalDiasLicencia)){
// //         // No es posible asignar las licencias requeridas. Hay que alertar!
// //         indicadores[0].intervalos[0].asignadas = totalDiasLicencia; 
// //     }
// //     else{
// //         // Es posible asignar las licencias requeridas. Hay que ajustar los
// //         // indicadores para reflejar cuantos dias se restan a cada anio
// //         for (let indicador of indicadores){
// //             for (const intervalo of indicador.intervalos){
// //                 if (intervalo.totales){
// //                     const diasDisponibles = intervalo.totales - intervalo.ejecutadas;
// //                     if ( diasDisponibles ==  0 ) break;
// //                     if ( diasDisponibles <=  totalDiasLicencia ){
// //                         totalDiasLicencia = totalDiasLicencia - diasDisponibles;
// //                         intervalo.asignadas = diasDisponibles;
// //                     }
// //                     else{
// //                         intervalo.asignadas = totalDiasLicencia;
// //                         totalDiasLicencia = 0;
// //                     }
// //                 }
// //                 else{ 
// //                     // No habria limite de licencias. Asignamos todos los dias a este intervalo
// //                     // TODO Revisar si efectivamente asi deberia ser el comportamiento correcto
// //                     intervalo.asignadas = totalDiasLicencia;
// //                 }
                
// //             }   
// //         } 
// //     }
// //     return indicadores;
// // }


// export async function insertAusentismo(ausentismo){
//     const obj = new AusenciaPeriodo(ausentismo);
//     return await obj.save();
// }

// export async function deleteAusentismo(ausentismo){
//     let obj = await utils.findObjectById(ausentismo._id, AusenciaPeriodo);
//     return await obj.delete();
// }


// export function generarDiasAusencia(ausentismo, diasAusencia){
//     let ausencias = [];
//     for (const dia of diasAusencia){
//         const ausencia = new Ausencia({
//             agente: ausentismo.agente, 
//             fecha: utils.parseDate(new Date(dia)),
//             articulo: ausentismo.articulo
//             }
//         )
//         ausencias.push(ausencia);
//     }
//     return ausencias;
// }



// export function generarAusencias(agente, articulo, diasAusencia){
//     let ausencias = [];
//     for (const dia of diasAusencia){
//         const ausencia = new Ausencia({
//             agente: agente, 
//             fecha: utils.parseDate(new Date(dia)),
//             articulo: articulo
//             }
//         )
//         ausencias.push(ausencia);
//     }
//     return ausencias;
// }