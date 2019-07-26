import { Types } from 'mongoose';

import { Ausencia } from '../schemas/ausencia';
import { AusenciaPeriodo } from '../schemas/ausenciaPeriodo';
import { Agente } from '../../agentes/schemas/agente';

// import { attachFilesToObject } from '../../../core/files/controller/file';
import { IndicadorAusentismo } from '../schemas/indicador';


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
            agente: req.body.agente, 
            articulo: req.body.articulo,
            fechaDesde: req.body.fechaDesde? new Date(req.body.fechaDesde):null,
        };
    let ausencias = await sugerirAusencias(
        ausentismo.agente, ausentismo.articulo, ausentismo.fechaDesde);
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
        ausentismo.articulo= req.body.articulo;
        ausentismo.fechaDesde= req.body.fechaDesde;
        ausentismo.fechaHasta= req.body.fechaHasta;
        ausentismo.cantidadDias= req.body.cantidadDias;
        ausentismo.observacion= req.body.observacion;
        ausentismo.adicional= req.body.adicional;
        ausentismo.extra= req.body.extra;
        ausentismo.certificado= req.body.certificado;
        // ausentismo.ausencias = generarAusencias(ausentismo);
        const ausentismoUpdated = await ausentismo.save();
        return res.json(ausentismoUpdated);
    } catch (err) {
        return next(err);
    }
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

export async function calcularAusencias(agente, articulo, desde, hasta, dias){
    desde = desde? new Date(desde.getFullYear(), desde.getMonth(), desde.getDate()):null;
    hasta = hasta? new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate()):null;
    let ausenciasCalculadas = procesaDias(agente, articulo, desde, hasta, dias);
    return ausenciasCalculadas;
}   

export async function sugerirAusencias(agente, articulo, desde){
    desde = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());
    console.log('Vamos a sugerir los dias de ausencia');
    let ausenciasSugeridas:any;
    let indicadores = await getIndicadoresAusencias(agente, articulo, desde);
    console.log('Indicadores recuperados');
    for (const indicador of indicadores){
        console.log(indicador.periodo);
        console.log(indicador.vigencia);
        console.log(indicador.intervalos);
        console.log("#####################################");
    }
    let indicadoresConProblemas = getIndicadoresSugeridosConProblemas(indicadores, desde);
    if (indicadoresConProblemas.length){
        ausenciasSugeridas = {
            desde: desde,
            ausencias: [],
            warnings: indicadoresConProblemas
        }
    }
    else{
        console.log('Vamos a buscar el indicador mas relevante');
        let indicador = getIndicadorMasRelevante(indicadores, desde);
        console.log('Indicador Relevante:');
        console.log(indicador.periodo);
        console.log(indicador.vigencia);
        console.log(indicador.intervalos);
        let diasDisponibles = indicador.intervalos[0].disponibles;
        console.log('Dias disponibles:');
        console.log(diasDisponibles);
    
        if ( diasDisponibles > 0){
            ausenciasSugeridas = procesaDias(agente, articulo, desde, null, diasDisponibles)
        }
        else{
            // No de deberiamos estar en esta condicion nunca
        }
    }
    return ausenciasSugeridas;
}

export function getIndicadoresSugeridosConProblemas(indicadores, fechaInteres){
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
    return indicadoresConProblemas;
}

export function getIndicadoresFinalesConProblemas(indicadores){
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

export function getIndicadorMasRelevante(indicadores, fechaInteres){
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
    indicadorRelevante.intervalos = [intervaloRelevante];
    return indicadorRelevante;
}

export async function validarAusencias(agente, articulo, desde, hasta, dias){
    desde = desde? new Date(desde.getFullYear(), desde.getMonth(), desde.getDate()):null;
    hasta = hasta? new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate()):null;

    let ausenciasCalculadas = procesaDias(agente, articulo, desde, hasta, dias);

    let indicadores = await getIndicadoresAusencias(agente, articulo, ausenciasCalculadas.desde, ausenciasCalculadas.hasta);
    
    let indicadoresRecalculados = distribuirAusenciasEntreIndicadores(indicadores, ausenciasCalculadas);

    let indicadoresConProblemas = getIndicadoresFinalesConProblemas(indicadoresRecalculados);
    
    if (indicadoresConProblemas.length){
        ausenciasCalculadas.warnings = indicadoresConProblemas;
    }
    return ausenciasCalculadas;
}


export function procesaDias(agente, articulo, desde, hasta?, dias?){
    let ausencias:any;
    if (articulo.diasCorridos){
        ausencias = procesaDiasCorridos(desde, hasta, dias);
    }

    if (articulo.diasHabiles){
        ausencias = procesaDiasHabiles(desde, hasta, dias);
    }
    return ausencias;
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

export async function getIndicadoresAusencias(agente, articulo, desde, hasta?){
    let indicadores = [];
    for (let formula of articulo.formulas ) {        
        if ( formula.periodo ){
            indicadores = indicadores.concat(
                await getIndicadoresConPeriodo(agente, articulo, formula, desde, hasta));   
        }
        else {
            indicadores = indicadores.concat(
                await getIndicadoresSinPeriodo(agente, articulo, formula, desde, hasta));
        }
    }
    return indicadores;
}

export async function getIndicadoresConPeriodo(agente, articulo, formula, desde, hasta?){
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

export async function getIndicadoresSinPeriodo(agente, articulo, formula, desde?, hasta?){
    let indicador:any;
    if ( formula.diasContinuos ){
        indicador = await crearIndicadoresAusentismo(agente, articulo, formula)
    }
    else {
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

export function procesaDiasCorridos(desde:Date, hasta?:Date, dias?:number){
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
        ausencias: ausencias 
    }
}

export function procesaDiasHabiles(desde:Date, hasta?:Date, dias?){
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
        ausencias: ausencias 
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
    console.log('Vamos a distribuir las ausencias');
    console.log('Primero filtramos los indicadores a solo los de interes');
    
    let indicadoresFiltrados = [];
    for (let indicador of indicadores){
        let indicadorFiltrado = filterIntervalosIndicador(indicador, ausentismo.desde, ausentismo.hasta)
        indicadoresFiltrados.push(indicadorFiltrado);
    }
    indicadores = indicadoresFiltrados;

    console.log('Luego distribuimos las ausencias que le corresponden a cada intervalo de los periodos');

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


