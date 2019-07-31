import { Types } from 'mongoose';

import { Ausencia } from '../schemas/ausencia';
import { AusenciaPeriodo } from '../schemas/ausenciaPeriodo';
import { Agente } from '../../agentes/schemas/agente';

// import { attachFilesToObject } from '../../../core/files/controller/file';
import { IndicadorAusentismo } from '../schemas/indicador';
import { format } from 'util';
import { Articulo } from '../schemas/articulo';


export async function getAusenciaById(req, res, next) {
    try {
        let obj = await Ausencia.findById(req.params.id);
        return res.json(obj);
    } catch (err) {
        return next(err);
    }
}


export async function addAusencia(req, res, next) {
    try {
        const obj = new Ausencia({
            agente: req.body.agente, 
            fecha: req.body.fecha,
            articulo: req.body.articulo,
            observacion: req.body.observacion,
            adicional: req.body.adicional,
            extra: req.body.extra,
            adjuntos: req.body.adjuntos,
            certificado: req.body.certificado
        });
        const objNuevo = await obj.save();
        return res.json(objNuevo);
    } catch (err) {
        return next(err);
    }
}

export async function getAusenciasPeriodo(req, res, next) {
    try {
        let results = [];
        let query = AusenciaPeriodo.find({});
        // Params
        const agenteId = req.query.agenteId;
        const articuloId = req.query.articuloId;
        const fechaDesde = req.query.fechaDesde;
        const fechaHasta = req.query.fechaHasta;
        console.log('AgenteID');
        console.log(agenteId);
        console.log('ArticuloID');
        console.log(articuloId);
        console.log('fechaDesde');
        console.log(fechaDesde);
        console.log('fechaHasta');
        console.log(fechaHasta)

        let agente:any = await findObjectById(agenteId, Agente);
        if (!agente){
            return res.json(results);
        }
        else{
            query.where('agente.id').equals(agenteId);
        }
        if (articuloId) {
            query.where('articulo.id').equals(articuloId);
        }
        if (fechaDesde) {
            query.where({'fechaDesde': { $gte: fechaDesde }})
        }
        if (fechaHasta) {
            query.where({'fechaHasta': { $lte: fechaHasta }})
        }
        results = await query.sort({ fechaHasta: -1 }).exec();
        return res.json(results);
    } catch (err) {
        return next(err);
    }
}

export async function getAusentismoById(req, res, next){
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) return next(404);
        let obj:any = await AusenciaPeriodo.findById(id);
        if (!obj) return next(404);
        return res.json(obj);
    } catch (err) {
        return next(err);
    }
}

export async function findObjectById(objectId, Model){
    if (!objectId || (objectId && !Types.ObjectId.isValid(objectId))) return;
    return await Model.findById(objectId);
    
}

export async function addAusentismo(req, res, next) {
    try {
        // let adjuntos = req.body.adjuntos;
        const ausentismo = {
                agente: req.body.agente, 
                articulo: req.body.articulo,
                fechaDesde: req.body.fechaDesde? new Date(req.body.fechaDesde):null,
                fechaHasta: req.body.fechaHasta? new Date(req.body.fechaHasta):null,
                cantidadDias: req.body.cantidadDias,
                observacion: req.body.observacion,
                adicional: req.body.adicional,
                extra: req.body.extra,
                certificado: req.body.certificado,
                ausencias: []
            };
        console.log('Vamos a crear las ausencias!!!');
        let ausenciasCalculadas = await validarAusencias(
            ausentismo.agente, ausentismo.articulo, ausentismo.fechaDesde,
            ausentismo.fechaHasta, ausentismo.cantidadDias);
        if (ausenciasCalculadas.warnings && ausenciasCalculadas.warnings.length){
            return res.json(ausenciasCalculadas);
        }
        else{
            ausentismo.ausencias = generarAusencias(ausentismo, ausenciasCalculadas.ausencias);
            const obj = new AusenciaPeriodo(ausentismo);
            const objNuevo = await obj.save();
            // // if (objNuevo && adjuntos && adjuntos.length){
            // //     await attachFilesToObject(adjuntos, objNuevo._id);
            // // }
            return res.json(objNuevo);
        }
    } catch (err) {
        return next(err);
    }
}

export async function sugerirAusentismo(req, res, next) {
    try {
        const ausentismo = {
            id: req.body.id, 
            agente: req.body.agente, 
            articulo: req.body.articulo,
            fechaDesde: req.body.fechaDesde? new Date(req.body.fechaDesde):null,
        };
    let ausencias = await sugerirAusencias(ausentismo);
    return res.json(ausencias);
    } catch (err) {
        return next(err);
    }
}


export async function calcularAusentismo(req, res, next) {
    try {
        const ausentismo = {
            agente: req.body.agente,
            articulo: req.body.articulo,
            fechaDesde: req.body.fechaDesde? new Date(req.body.fechaDesde):null,
            fechaHasta: req.body.fechaHasta? new Date(req.body.fechaHasta):null,
            cantidadDias: req.body.cantidadDias
        };
    let ausencias = await calcularAusencias(
        ausentismo.agente, ausentismo.articulo, ausentismo.fechaDesde, ausentismo.fechaHasta,
        ausentismo.cantidadDias);
    return res.json(ausencias);
    } catch (err) {
        return next(err);
    }
}

export async function updateAusentismo(req, res, next){
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) return res.status(404).send();
        let ausentismo:any = await AusenciaPeriodo.findById(id);
        if (!ausentismo) return res.status(404).send();
        let auToUpdate = parseAusentismoReqBody(req);
        let ausenciasCalculadas = await validarAusenciasEnEdicion(
            ausentismo,
            auToUpdate.agente, auToUpdate.articulo, auToUpdate.fechaDesde,
            auToUpdate.fechaHasta, auToUpdate.cantidadDias);
        console.log('Ausencias Calculadas');
        console.log(ausenciasCalculadas);
        // ausentismo.articulo= req.body.articulo;
        // ausentismo.fechaDesde= req.body.fechaDesde;
        // ausentismo.fechaHasta= req.body.fechaHasta;
        // ausentismo.cantidadDias= req.body.cantidadDias;
        // ausentismo.observacion= req.body.observacion;
        // ausentismo.adicional= req.body.adicional;
        // ausentismo.extra= req.body.extra;
        // ausentismo.certificado= req.body.certificado;
        // ausentismo.ausencias = generarAusencias(ausentismo);
        // const ausentismoUpdated = await ausentismo.save();
        return res.json(ausenciasCalculadas);
    } catch (err) {
        return next(err);
    }
}

function parseAusentismoReqBody(req){
    let ausentismo = {
        agente: req.body.agente, 
        articulo: req.body.articulo,
        fechaDesde: req.body.fechaDesde? new Date(req.body.fechaDesde):null,
        fechaHasta: req.body.fechaHasta? new Date(req.body.fechaHasta):null,
        cantidadDias: req.body.cantidadDias,
        observacion: req.body.observacion,
        adicional: req.body.adicional,
        extra: req.body.extra
    };
    return ausentismo;
}

export function generarAusencias(periodo, dias){
    let ausencias = [];
    for (const dia of dias){
        const ausencia = new Ausencia({
            agente: periodo.agente, 
            fecha: dia,
            articulo: periodo.articulo
            }
        )
        ausencias.push(ausencia);
    }
    return ausencias;
}

export function parseDate(date){
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getFormattedDate(date) {
    const month = format(date.getMonth() + 1);
    const day = format(date.getDate());
    const year = format(date.getFullYear());
    return  day + "/" + month + "/" + year;
}

export function formatWarningsIndicadores(indicadores){
    let textControl = `Limite de ausencias superado`;
    let warningsText = []; 
    for (const indicador of indicadores){
        let textWarning = ``;
        if (indicador.periodo){
            for (const intervalo of indicador.intervalos){
                const desde = getFormattedDate(intervalo.desde);
                const hasta = getFormattedDate(intervalo.hasta);
                textWarning = `${textControl}. ${indicador.periodo}: (${desde} - ${hasta})`;
            }
        }
        else{
            textWarning = `${textControl}. ${textWarning} Periodo Total.`;
        }
        warningsText.push(textWarning)
    }
   return warningsText;
}

export function formatWarningsSuperposicion(ausentismosPrevios){
    let textControl = `Conflicto de fechas con Articulo `;
    let warningsText = []; 
    for (const ausentismo of ausentismosPrevios){
        let textWarning = ``;
            const desde = getFormattedDate(ausentismo.fechaDesde);
            const hasta = getFormattedDate(ausentismo.fechaHasta);
            const articulo = ausentismo.articulo.codigo;
            textWarning = `${textControl}. ${articulo}: (${desde} - ${hasta})`;
            warningsText.push(textWarning)    
        }
   return warningsText;
}

export function procesarWarnings(){

}

export async function calcularAusencias(agente, articulo, desde, hasta, dias){
    desde = desde? parseDate(desde) : null;
    hasta = hasta? parseDate(hasta) : null;
    articulo = await Articulo.findById(articulo.id);// get articulo con formulasausentismo.articulo;
    let ausenciasCalculadas = calculaDiasAusencias(agente, articulo, desde, hasta, dias);
    return ausenciasCalculadas;
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
export async function sugerirAusencias(ausentismo){
    let agente = ausentismo.agente;
    let articulo = await Articulo.findById(ausentismo.articulo.id);// get articulo con formulas
    let fechaDesde = parseDate(ausentismo.fechaDesde);
    // let ausencias:any = { desde: fechaDesde, ausencias: [], warnings: []}
    let warnings = [];
    
    let indicadores = await findIndicadoresAll(agente, articulo, fechaDesde);
    let ausencias = await calculaDiasAusencias(agente, articulo, fechaDesde, null, getMaxDiasDisponibles(indicadores, fechaDesde))
    
    warnings = warnings.concat(formatWarningsIndicadores(await controlIndicadoresSugerencia(indicadores, fechaDesde, ausentismo)));
    warnings = warnings.concat(formatWarningsSuperposicion(await controlSuperposicion(agente, articulo, ausencias.desde, ausencias.hasta, ausentismo)));

    ausencias.warnings = warnings;
    return ausencias;
}


/**
 * Identifica y retorna indicadores que hayan alcanzado el numero maximo de ausencias
 * permitida por periodo. El listado de indicadores con problemas solo incluira el
 * intervalo del periodo que presenta problemas de acuerdo a la fecha de interes.
 * Por ejemplo si un indicador indica que para el mes de abril no hay mas ausencias
 * disponibles y la fecha de interes (fecha inicio del ausentismo) es precisamente
 * un dia de abril, entonces este indicador se retornara como parte del control. 
 * Si no hay problemas detectados se retorna un array vacio.
 * @param indicadores Listado total de indicadores para un articulo en particular
 * @param fechaInteres Es la fecha desde del ausentismo a cargar
 * @param ausentismo Opcional. Si esta presente 
 */
export function controlIndicadoresSugerencia(indicadores, fechaInteres, ausentismo?){
    let indicadoresConProblemas = [];
    for (const indicador of indicadores){
        let intervaloConProblemas:any;
        for (const intervalo of indicador.intervalos){
            if (!intervalo.hasta || (intervalo.hasta >= fechaInteres)) {
                if( intervalo.disponibles <= 0) {
                    intervaloConProblemas = intervalo;
                }
                break;
            }
        }
        if (intervaloConProblemas){
            indicador.intervalos = [intervaloConProblemas];
            indicadoresConProblemas.push(indicador)
        }     
    }

    // if (ausentismo){

    // }
    return indicadoresConProblemas;
}

export function controlIndicadoresGuardado(indicadores){
    let indicadoresConProblemas = [];
    for (const indicador of indicadores){
        let intervaloConProblemas:any;
        for (const intervalo of indicador.intervalos){
            const restoDiasDisponibles = intervalo.disponibles - intervalo.asignadas;
            if( restoDiasDisponibles < 0) {
                intervaloConProblemas = intervalo;
                break;
            }
        }
        if (intervaloConProblemas){
            indicador.intervalos = [intervaloConProblemas];
            indicadoresConProblemas.push(indicador)
        }     
    }
    return indicadoresConProblemas;
}


/**
 * Identifica y retorna el indicador mas relevante para el usuario. Es una
 * utilidad para luego simplificar los controles sobre los dias disponibles.
 * Asumimos que el indicador mas relevante es aquel que tiene un periodo con
 * la mayor cantidad de intervalos y uno de esos intervalos esta dentro de la
 * fecha de interes. Por ejemplo si el indicador tiene un periodo anual y otro
 * mensual, entonces vamos a retornar el indicador con el periodo mensual y el
 * intervalo mas proximo a la fecha de interes
 * @param indicadores Listado de indicadores para un articulo en particular
 * @param fechaInteres Es la fecha desde del ausentismo a cargar  
 */
export function getMaxDiasDisponibles(indicadores, fechaInteres){
    let indicadorRelevante:any;
    let intervaloRelevante:any;
    indicadorRelevante = indicadores[0];
    for (const indicador of indicadores) {
        if (indicador.intervalos.length > indicadorRelevante.intervalos.length){
            indicadorRelevante = indicador;
        }
    }
    for (const intervalo of indicadorRelevante.intervalos){
        if (!intervalo.hasta || (intervalo.hasta >= fechaInteres)) {
            intervaloRelevante = intervalo;
            break;
        } 
    }
    // if (intervaloRelevante) intervalos[0].disponibles
    // indicadorRelevante.intervalos = [intervaloRelevante];
    // if (indicador){
    //     dias = indicador.intervalos[0].disponibles;
    // }
    return intervaloRelevante? intervaloRelevante.disponibles : 0;
}

export async function validarAusencias(agente, articulo, desde, hasta, dias){
    desde = desde? parseDate(desde) : null;
    hasta = hasta? parseDate(hasta) : null;

    let ausencias = calculaDiasAusencias(agente, articulo, desde, hasta, dias);
    let indicadores = await findIndicadoresAll(agente, articulo, ausencias.desde, ausencias.hasta);
    let indicadoresRecalculados = distribuirAusenciasEntreIndicadores(indicadores, ausencias);
    let warnings = controlIndicadoresGuardado(indicadoresRecalculados);
    
    if (warnings.length){
        ausencias.warnings = ausencias.warnings.concat(formatWarningsIndicadores(warnings));
    }

    warnings = await controlSuperposicion(agente, articulo, ausencias.desde, ausencias.hasta);
    ausencias.warnings = ausencias.warnings.concat(formatWarningsSuperposicion(warnings));
    return ausencias;
}

async function primerPaso(ausentismo){
    let desde = parseDate(ausentismo.fechaDesde);// desde? parseDate(desde) : null;
    let hasta = parseDate(ausentismo.fechaHasta); //hasta? parseDate(hasta) : null;
    let agente = ausentismo.agente;
    let articulo = await Articulo.findById(ausentismo.articulo.id);// get articulo con formulasausentismo.articulo;
    let dias = ausentismo.cantidadDias;
    let ausencias = calculaDiasAusencias(agente, articulo, desde, hasta, dias);
    let indicadores = await findIndicadoresAll(agente, articulo, ausencias.desde, ausencias.hasta);
    let indicadoresRecalculados = distribuirAusenciasEntreIndicadores(indicadores, ausencias);
    indicadoresRecalculados = rollbackIndicadores(indicadoresRecalculados);
    return indicadoresRecalculados;
}

function mergeIndicadores(indicadoresNuevos, indicadoresPrevios){
    for (let indNuevo of indicadoresNuevos){
        for (let intervalo of indNuevo.intervalos){
            const intEncontrado = findIntervalo(intervalo, indicadoresPrevios);
            if (intEncontrado){
                intervalo.ejecutadas = intEncontrado.ejecutadas;
                intervalo.disponibles = intEncontrado.disponibles;
            }
            
        }
    }
    return indicadoresNuevos;
}

function findIntervalo(intervalo, indicadores){
    let intervaloEncontrado;
    for (const indicador of indicadores){
        for (const int of indicador.intervalos){
            if (int.desde.getTime() == intervalo.desde.getTime() &&
                int.hasta.getTime() == intervalo.hasta.getTime()){
                    intervaloEncontrado = int;
                    break;
                }
        }
        if (intervaloEncontrado) break;
    }   
    return intervaloEncontrado;
}

export async function validarAusenciasEnEdicion(ausentismo, agente, articulo, desde, hasta, dias){
    console.log('Vamos a validar un update');
    desde = desde? parseDate(desde) : null;
    hasta = hasta? parseDate(hasta) : null;
    articulo = await Articulo.findById(ausentismo.articulo.id);// get articulo con formulasausentismo.articulo;

    let ausencias = calculaDiasAusencias(agente, articulo, desde, hasta, dias);
    let indicadores = await findIndicadoresAll(agente, articulo, ausencias.desde, ausencias.hasta);
    let indicadoresRecalculados = distribuirAusenciasEntreIndicadores(indicadores, ausencias);
    console.log('Indicadores indicadoresRecalculados##############################');
    for (let i of indicadoresRecalculados) console.log(i);
    let indicadoresRollback = await primerPaso(ausentismo);
    console.log('Indicadores Rollback#############################################');
    for (let i of indicadoresRollback) console.log(i);
    let indicadoresFinales = mergeIndicadores(indicadoresRecalculados, indicadoresRollback);
    console.log('Terminamos de hacer el merge####################################');
    for (let i of indicadoresFinales) console.log(i);

    let warnings = [];
    
    warnings = warnings.concat(formatWarningsIndicadores(await controlIndicadoresGuardado(indicadoresFinales)));
    console.log('Warnings');
    console.log(warnings)
    warnings = warnings.concat(formatWarningsSuperposicion(await controlSuperposicion(agente, articulo, ausencias.desde, ausencias.hasta, ausentismo)));

    ausencias.warnings = warnings;

    // let warnings = getIndicadoresFinalesConProblemas(indicadoresFinales);
    
    // if (warnings.length){
    //     ausencias.warnings = ausencias.warnings.concat(formatWarningsIndicadores(warnings));
    // }

    // warnings = await controlSuperposicion(agente, articulo, ausencias.desde, ausencias.hasta);
    // ausencias.warnings = ausencias.warnings.concat(formatWarningsSuperposicion(warnings));
    return ausencias;
}

function rollbackIndicadores(indicadores){
    for (let indicador of indicadores){
        for (let intervalo of indicador.intervalos){
            intervalo.ejecutadas = intervalo.ejecutadas - intervalo.asignadas;
            intervalo.disponibles = intervalo.disponibles + intervalo.asignadas; 
        }
    }
    return indicadores;
}


export function calculaDiasAusencias(agente, articulo, desde, hasta?, dias?){
    let ausencias:any;
    if (articulo.diasCorridos){
        ausencias = calculaDiasCorridos(desde, hasta, dias);
    }

    if (articulo.diasHabiles){
        ausencias = calculaDiasHabiles(desde, hasta, dias);
    }
    return ausencias;
}


/**
 * Busca ausencias previas existentes en un periodo determinado para un agente.
 * El parametro ausentismo se utiliza unicamente en el caso que se este en modo 
 * edicion, para evitar controlar con el mismo ausentismo que se esta editando
 * @param agente 
 * @param articulo 
 * @param desde 
 * @param hasta 
 * @param ausentismo Opcional. Unicamente necesario en modo edicion
 */
export async function controlSuperposicion(agente, articulo, desde, hasta, ausentismo?){
    let ausentismos = await AusenciaPeriodo.find({
        'agente.id': agente.id,
        'ausencias': {
            $elemMatch: {
                fecha: {
                    $gte: desde,
                    $lte: hasta
                }
            }
        }
    });
    if (ausentismo){
        ausentismos = ausentismos.filter(au => au.id != ausentismo.id);
    }
    return ausentismos;
}


/**
 * Utilidad para reducir el nro de indicadores a analizar
 * @param indicador 
 * @param desde 
 * @param hasta 
 */
export function filterIntervalosIndicador(indicador, desde, hasta){
    let filteredIntervalos = [];
    if (indicador.periodo){
        let cotaInferior = false;
        for( let intervalo of indicador.intervalos ) {
            if ( !cotaInferior){
                if (intervalo.hasta >= desde) {
                    filteredIntervalos.push(intervalo);
                    cotaInferior = true;
                }
            }
            else{
                if (intervalo.desde > hasta) break;
                filteredIntervalos.push(intervalo);
            }
        }
        indicador.intervalos = filteredIntervalos;
    }
    return indicador;
}

/**
 * Dado un agente y articulo recupera un listado de indicadores del agente con
 * informacion sobre totales de ausencias, licencias ejecutadas y disponibles
 * para cada periodo definido en las formulas del articulo
 * @param agente 
 * @param articulo 
 * @param desde 
 * @param hasta 
 * @returns [IndicadorAusentismoSchema]
 */
export async function findIndicadoresAll(agente, articulo, desde, hasta?){
    let indicadores = [];
    for (let formula of articulo.formulas ) {        
        if ( formula.periodo ){
            indicadores = indicadores.concat(
                await getIndicadorConPeriodo(agente, articulo, formula, desde, hasta));   
        }
        else {
            indicadores = indicadores.concat(
                await getIndicadorSinPeriodo(agente, articulo, formula, desde, hasta));
        }
    }
    return indicadores;
}


/**
 * Retorna un indicador aplicable unicamente a aquellos articulos que si tienen 
 * por definicion un numero acotado o maximo de ausencias en un periodo determinado.
 * Por ejemplo el articulo 80 Asuntos Personales, restringe el numero maximo de 
 * ausencias a un maximo 10 en el periodo de un anio o a solo dos en el periodo de
 * un mes.
 * Cada indicador indica totales de ausencias, licencias ejecutadas y disponibles.
 * @param agente 
 * @param articulo 
 * @param formula 
 * @param desde 
 * @param hasta
* @returns [IndicadorAusentismoSchema]
 */
export async function getIndicadorConPeriodo(agente, articulo, formula, desde, hasta?){
    const anioDesde = desde.getFullYear();
    const anioHasta = hasta? hasta.getFullYear() : null;
    let anios = [anioDesde];
    if (anioHasta && (anioDesde != anioHasta)) anios.push(anioHasta);
    let indicadores = [];
    for ( let anio of anios){
        let indicador = await IndicadorAusentismo.findOne(
            {
                'agente.id': new Types.ObjectId(agente.id),
                'articulo.id': new Types.ObjectId(articulo.id),
                'periodo': formula.periodo.nombre, // TODO Idealmente buscar por ID???
                'vigencia': anio // TODO analizar el tema de la vigencia correctamente
            });
        if (!indicador){
            indicador = await crearIndicadoresAusentismo(agente, articulo, formula, anio);
        }
        indicadores.push(indicador);
    }
    return indicadores;
}

/**
 * Retorna un indicador aplicable unicamente a aquellos articulos que NO tienen 
 * por definicion un numero acotado o maximo de ausencias en un periodo determinado
 * de tiempo.
 * Cada indicador indica totales de ausencias, ausencias ejecutadas y disponibles.
 * @param agente 
 * @param articulo 
 * @param formula 
 * @param desde 
 * @param hasta 
 * @returns [IndicadorAusentismoSchema]
 */
export async function getIndicadorSinPeriodo(agente, articulo, formula, desde?, hasta?){
    let indicador:any;
    if ( formula.diasContinuos ){
        // Si la formula del articulo exige que los dias de licencias
        // sean continuos no es necesario recuperar un indicador con
        // informacion previa sobre dias disponibles
        indicador = await crearIndicadoresAusentismo(agente, articulo, formula)
    }
    else {
        // Si la formula del articulo no exige que los dias de licencias
        // sean continuos, se deben recuperar los indicadores previos
        // existentes (es decir el historico de ausencias)
        indicador = await IndicadorAusentismo.findOne(
            {
                'agente.id': new Types.ObjectId(agente.id),
                'articulo.id': new Types.ObjectId(articulo.id),
                'periodo': null,
            });
        if (!indicador) indicador = await crearIndicadoresAusentismo(agente, articulo, formula);
    }
    return indicador;
}

export async function findIndicadorAusentismo(agente, articulo){

}

export async function crearIndicadoresAusentismo(agente, articulo, formula, anio?){
    let indicadorAusentismo:any= {
        agente: agente,
        articulo: articulo,
        vigencia: anio,
        periodo: formula.periodo? formula.periodo.nombre : null,
        intervalos: []
    }
    indicadorAusentismo.intervalos = await calcularIndicadoresPorIntervalo(
                                        agente, articulo, formula, anio);
    return indicadorAusentismo;
}

export async function calcularIndicadoresPorIntervalo(agente, articulo, formula, anio?){
    let intervalos = [];
    let indicadoresIntervalo: any;
    if (!formula.periodo){
        if ( formula.diasContinuos ){
            indicadoresIntervalo = {
                totales: formula.limiteAusencias,
                ejecutadas: 0,
                disponibles: formula.limiteAusencias
            }
        }
        else{
            let totales = formula.limiteAusencias;
            let ejecutadas = await getTotalAusenciasPorArticulo(agente, articulo);
            indicadoresIntervalo = {
                totales: formula.limiteAusencias,
                ejecutadas: ejecutadas,
                disponibles: totales - ejecutadas
            }
        }
        intervalos.push(indicadoresIntervalo)
    }
    else{
        let periodoConfiguracion = constantes[formula.periodo.nombre];
        for ( let int of periodoConfiguracion.intervalos){
            let desde = int.desde? new Date(anio, int.desde.mes, int.desde.dia) : null;
            let hasta = int.hasta? new Date(anio, int.hasta.mes, int.hasta.dia) : null;
            let totales = formula.limiteAusencias;
            let ejecutadas = await getTotalAusenciasPorArticulo(agente, articulo, desde, hasta);
            let disponibles = totales - ejecutadas;     
            indicadoresIntervalo = {
                desde: desde,
                hasta: hasta,
                totales: totales,
                ejecutadas: ejecutadas,
                disponibles: disponibles
            }
            intervalos.push(indicadoresIntervalo)
        };
    }

    return intervalos;
}

export function calculaDiasCorridos(desde:Date, hasta?:Date, dias?:number){
    let ausencias = [];
    let totalDias = 0;
    if (hasta && !dias){
        let fechaAusencia = desde;
        while(fechaAusencia <= hasta){
            totalDias = totalDias + 1;
            ausencias.push(new Date(fechaAusencia));
            fechaAusencia = addOneDay(fechaAusencia);
        }
    }
    if (dias){ // Si tiene fecha hasta igualmente toma precedencia la cantidad de dias
        let fechaAusencia = desde;
        for (let i = 0; i < dias ; i++) {
            hasta = fechaAusencia;
            ausencias.push(new Date(fechaAusencia));
            fechaAusencia = addOneDay(fechaAusencia);    
        }
        totalDias = dias;
    }
    return {
        desde: desde,
        hasta: hasta,
        dias: totalDias,
        ausencias: ausencias,
        warnings:[]
    }
}

export function calculaDiasHabiles(desde:Date, hasta?:Date, dias?){
    let ausencias = [];
    let totalDias = 0;
    if (hasta && !dias){
        let fechaAusencia = desde;
        while(fechaAusencia <= hasta){
            if (esDiaHabil(fechaAusencia)){
                totalDias = totalDias + 1;
                ausencias.push(new Date(fechaAusencia));
            }
            fechaAusencia = addOneDay(fechaAusencia);
        }
    }
    if (dias){ // Si tiene fecha hasta igualmente toma precedencia la cantidad de dias
        let fechaAusencia = desde;
        let i = 0;
        while (i < dias){
            while (!esDiaHabil(fechaAusencia)){
                fechaAusencia = addOneDay(fechaAusencia);    
            }        
            hasta = fechaAusencia;
            ausencias.push(new Date(fechaAusencia));
            i = i + 1;
            fechaAusencia = addOneDay(fechaAusencia);    
        }
        totalDias = dias;
    }
    return {
        desde: desde,
        hasta: hasta,
        dias: totalDias,
        ausencias: ausencias,
        warnings: []
    }
}


export function addOneDay(fecha){
    let tomorrow = new Date(fecha);
    return new Date(tomorrow.setDate(tomorrow.getDate() + 1));
}

export function esFeriado(date){
    return false;
}

export function esDiaHabil(date){
    let esDiaHabil = true;
    let finDeSemanas = [new Date(2019,6,20), new Date(2019,6,21), new Date(2019,6,27), new Date(2019,6,28)];
    let feriados = [new Date(2019,6,18), new Date(2019,6,23)]
    for (let finde of finDeSemanas){
        if (date.getTime() === finde.getTime()) {
            esDiaHabil = false;
            break;
        }
    }
    if (esDiaHabil){
        for (let feriado of feriados){
            if (date.getTime() === feriado.getTime()) {
                esDiaHabil = false;
                break;
            };
        }
    }
    return esDiaHabil;
}

export async function getTotalAusenciasPorArticulo(agente, articulo, desde?, hasta?){
    let pipeline:any = [
        { $match: { 'agente.id': Types.ObjectId(agente.id), 'articulo.id': Types.ObjectId(articulo.id) } },
        { $unwind: '$ausencias'}
    ]
    if (desde && hasta){
        // Filtramos por fecha desde y hasta solo si estos params estan presentes
        pipeline.push({ $match: { 'ausencias.fecha':{ $gte:desde, $lte: hasta} } });
    }
    // Finalmente contabilizamos el total de ausencias
    pipeline.push({ $count: 'total_ausencias'})
        
    let total = await AusenciaPeriodo.aggregate(pipeline);
    return total.length? total[0].total_ausencias : 0;
}

export function distribuirAusenciasEntreIndicadores(indicadores, ausentismo){
    let indicadoresFiltrados = [];
    for (let indicador of indicadores){
        let indicadorFiltrado = filterIntervalosIndicador(indicador, ausentismo.desde, ausentismo.hasta)
        indicadoresFiltrados.push(indicadorFiltrado);
    }
    indicadores = indicadoresFiltrados;
    for (let indicador of indicadores){
        for (let intervalo of indicador.intervalos){
            intervalo.asignadas = 0; // Inicializamos en 0 el contador
            if ( !indicador.periodo || 
                (intervalo.desde <= ausentismo.desde && 
                intervalo.hasta >= ausentismo.hasta)){
                // Asignamos el total de dias de ausnecias al intervalo
                intervalo.asignadas = ausentismo.ausencias.length;
            }
            else{
                for (let dia of ausentismo.ausencias){
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

export const constantes = {
    PERIODO_INDETERMINADO: {
        intervalos: [{}]
    },
    PERIODO_CONSTANTE: {
        intervalos: [{desde: {dia:1, mes:0}, hasta:{dia:31, mes:11 } }]
    },
    PERIODO_ANUAL: {
        intervalos: [{desde: {dia:1, mes:0}, hasta:{dia:31, mes:11 } }]
    },
    PERIODO_TRIMESTRE: {
        intervalos: [
            {desde:{dia:1, mes:0}, hasta:{dia:31, mes:2}},
            {desde:{dia:1, mes:3}, hasta:{dia:30, mes:5}},
            {desde:{dia:1, mes:6}, hasta:{dia:30, mes:8}},
            {desde:{dia:1, mes:9}, hasta:{dia:31, mes:11}}]
    },
    PERIODO_CUATRIMESTRE: {
        intervalos: [
            {desde:{dia:1, mes:0}, hasta:{dia:30, mes:3}},
            {desde:{dia:1, mes:4}, hasta:{dia:31, mes:7}},
            {desde:{dia:1, mes:8}, hasta:{dia:31, mes:11}}]
    },
    PERIODO_MENSUAL: {
        intervalos: [
            {desde:{dia:1, mes:0}, hasta:{dia:31, mes:0}},
            {desde:{dia:1, mes:1}, hasta:{dia:28, mes:1}},
            {desde:{dia:1, mes:2}, hasta:{dia:31, mes:2}},
            {desde:{dia:1, mes:3}, hasta:{dia:30, mes:3}},
            {desde:{dia:1, mes:4}, hasta:{dia:31, mes:4}},
            {desde:{dia:1, mes:5}, hasta:{dia:30, mes:5}},
            {desde:{dia:1, mes:6}, hasta:{dia:31, mes:6}},
            {desde:{dia:1, mes:7}, hasta:{dia:31, mes:7}},
            {desde:{dia:1, mes:8}, hasta:{dia:30, mes:8}},
            {desde:{dia:1, mes:9}, hasta:{dia:31, mes:9}},
            {desde:{dia:1, mes:10}, hasta:{dia:30, mes:10}},
            {desde:{dia:1, mes:11}, hasta:{dia:31, mes:11}}]
    }
}


export function removeAusencias(ausentismo){

}


export async function validateAusencias(ausenciaPeriodo) {
    return true;
}


