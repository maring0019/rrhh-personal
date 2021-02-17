import { AusenciaPeriodo } from '../schemas/ausenciaperiodo';

import * as utils from '../commons/utils';
import { getIndicadoresLicencia } from '../commons/indicadores';

import { Types } from 'mongoose';
import { Agente } from '../../agentes/schemas/agente';
import { Ausencia } from '../schemas/ausencia';

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

export async function getAusentismo(req, res, next) {
    try {
        let results = [];
        // Params
        const agenteId = req.query.agenteId;
        const articuloId = req.query.articuloId;
        const fechaDesde = req.query.fechaDesde;
        const fechaHasta = req.query.fechaHasta;
        let matchParams = {};
        let agente:any = await utils.findObjectById(agenteId, Agente);
        if (!agente){
            return res.json(results);
        }
        else{
            matchParams['agente._id'] = Types.ObjectId(agenteId);
        }
        if (articuloId) {
            matchParams['articulo._id'] = Types.ObjectId(articuloId);
        }
        if (fechaDesde) {
            matchParams['fechaDesde'] = { $gte: new Date(fechaDesde) };
        }
        if (fechaHasta) {
            matchParams['fechaHasta'] = { $lte: new Date(fechaHasta) };
        }
        let pipeline:any = [
            { $match: matchParams },
            { $lookup: {
                from: "files.files",
                localField: "_id",
                foreignField: "metadata.objID",
                as: "adjuntos"
                }
            },
            { $limit: 365 },
            { $sort: { fechaHasta:-1 }}
        ]
        results = await AusenciaPeriodo.aggregate(pipeline);
        return res.json(results);
    } catch (err) {
        return next(err);
    }
}

export async function distribuirLicencias(req, res, next){
    try {
        const ausNewValues = res.locals.ausentismo;
        let ausentismo:any = await calcularDiasAusentismo(ausNewValues.agente, ausNewValues.articulo, ausNewValues.fechaDesde, ausNewValues.fechaHasta, ausNewValues.cantidadDias);
        ausentismo = {...ausNewValues, ...ausentismo }; // Copiamos los valores del ausentismo calculado
        let indicadores = await this.calcularIndicadores(ausentismo);
        return res.json(indicadores)
    }
    catch (err){
        return next(err);
    }
}

export async function addAusentismo(req, res, next) { 
    try {
        const ausentismo = res.locals.ausentismo;
        const controller = res.locals.controller;
        let response = await controller.addAusentismo(ausentismo);
        return res.json(response);
    } catch (err) {
        return next(err);
    }
}

export async function updateAusentismo(req, res, next){
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) return res.status(404).send();
        
        let ausentismoToUpdate:any = await AusenciaPeriodo.findById(id);
        if (!ausentismoToUpdate) return res.status(404).send();
        
        let ausentismoNewValues = res.locals.ausentismo;
        let controller = res.locals.controller;
        if (!ausentismoToUpdate.articulo._id.equals(ausentismoNewValues.articulo._id))
            return res.status(400).send({ message:"No se puede editar el Articulo!" });
        
        let response = "";
        if (utils.isSameDay(ausentismoToUpdate.fechaDesde, ausentismoNewValues.fechaDesde) &&
            utils.isSameDay(ausentismoToUpdate.fechaHasta, ausentismoNewValues.fechaHasta)){
            // Las fechas se mantienen igual por lo que aplicamos una simple actualizacion
            response = await controller.simpleUpdateAusentismo(ausentismoToUpdate, ausentismoNewValues);
        }
        else{
            // Las fechas se modificaron. Debemos aplicar una actualizacion completa de las
            // ausencias, indicadores, e indicadores historicos.
            response = await controller.fullUpdateAusentismo(ausentismoToUpdate, ausentismoNewValues);
        }
        return res.json(response);
        
    } catch (err) {
        return next(err);
    }
}

export async function deleteAusentismo(req, res, next){
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) return res.status(404).send();
        
        let ausentismoToDelete:any = await AusenciaPeriodo.findById(id);
        if (!ausentismoToDelete) return res.status(404).send();
        
        let controller = res.locals.controller;
        let response = await controller.deleteAusentismo(ausentismoToDelete);
        return res.json(response);  
    } catch (err) {
        return next(err);
    }
}



export async function sugerirDiasAusentismo(req, res, next) {
    try {
        
        let ausentismo = res.locals.ausentismo;
        let controller = res.locals.controller;
        let response = await controller.sugerirAusentismo(ausentismo);
        return res.json(response);
    } catch (err) {
        console.log(err)
        return next(err);
    }
}

export async function calcularAusentismo(req, res, next) {
    try {
        const ausentismo = await utils.parseAusentismo(req.body);
        let ausencias = await calcularDiasAusentismo(ausentismo.agente, ausentismo.articulo,
            ausentismo.fechaDesde, ausentismo.fechaHasta, ausentismo.cantidadDias);
    return res.json(ausencias);
    } catch (err) {
        return next(err);
    }
}



export async function getIndicadoresLicenciaAgente(req, res, next){
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) return next(404);
        let agente:any = await Agente.findById(id);
        if (!agente) return next(404);
        let indicadores = await getIndicadoresLicencia(agente);
        return res.json(indicadores);
    } catch (err) {
        return next(err);
    }

}



/**
 * Determina con precision la fecha desde, hasta, total de dias y las fechas
 * de los dias de ausencia, de acuerdo al tipo de dia indicado por el articulo
 * (dias corridos o habiles).
 * @param agente  
 * @param articulo Determina si se deben calcular dias corridos o habiles
 * @param desde 
 * @param hasta Opcional. Si se indica este valor se intenta determinar el total de dias
 * @param dias Opcional. Si se indica este valor se intenta determinar la fecha hasta
 * @returns [Promise<IDiasAusencia>]
 */
export async function calcularDiasAusentismo(agente, articulo, desde, hasta?, dias?){
    let diasAusencias;
    if ((!articulo.diasCorridos && !articulo.diaHabiles) || articulo.diasCorridos){
        diasAusencias = calculaDiasCorridos(desde, hasta, dias);
    }

    if (articulo.diasHabiles){
        diasAusencias = await calculaDiasHabiles(agente, desde, hasta, dias);
    }
    diasAusencias.ausencias = generarAusencias(agente, articulo, diasAusencias.ausencias);
    return diasAusencias;
}


export function calculaDiasCorridos(desde:Date, hasta?:Date, dias?:number){
    let ausencias = [];
    let totalDias = 0;
    if (hasta && !dias){
        let fechaAusencia = desde;
        while(fechaAusencia <= hasta){
            totalDias = totalDias + 1;
            ausencias.push(new Date(fechaAusencia));
            fechaAusencia = utils.addOneDay(fechaAusencia);
        }
    }
    if (dias){ // Si tiene fecha hasta igualmente toma precedencia la cantidad de dias
        let fechaAusencia = desde;
        for (let i = 0; i < dias ; i++) {
            hasta = fechaAusencia;
            ausencias.push(new Date(fechaAusencia));
            fechaAusencia = utils.addOneDay(fechaAusencia);    
        }
        totalDias = dias;
    }
    return {
        fechaDesde: desde,
        fechaHasta: hasta,
        cantidadDias: totalDias,
        ausencias: ausencias
    }
}


export async function calculaDiasHabiles(agente, desde:Date, hasta?:Date, dias?)
{
    let ausencias = [];
    let totalDias = 0;
    if (hasta && !dias){
        let fechaAusencia = desde;
        while(fechaAusencia <= hasta){
            if (await utils.esDiaHabil(agente, fechaAusencia)){
                totalDias = totalDias + 1;
                ausencias.push(new Date(fechaAusencia));
            }
            fechaAusencia = utils.addOneDay(fechaAusencia);
        }
    }
    if (dias){ // Si tiene fecha hasta igualmente toma precedencia la cantidad de dias
        let fechaAusencia = desde;
        let i = 0;
        while (i < dias){
            let esDiaHabil = await utils.esDiaHabil(agente, fechaAusencia)
            while (!esDiaHabil){
                fechaAusencia = utils.addOneDay(fechaAusencia);    
                esDiaHabil = await utils.esDiaHabil(agente, fechaAusencia)
            }        
            hasta = fechaAusencia;
            ausencias.push(new Date(fechaAusencia));
            i = i + 1;
            fechaAusencia = utils.addOneDay(fechaAusencia);    
        }
        totalDias = dias;
    }
    return {
        fechaDesde: desde,
        fechaHasta: hasta,
        cantidadDias: totalDias,
        ausencias: ausencias
    }
}


export function generarAusencias(agente, articulo, diasAusencia){
    let ausencias = [];
    for (const dia of diasAusencia){
        const ausencia = new Ausencia({
            agente: agente, 
            fecha: utils.parseDate(new Date(dia)),
            articulo: articulo
            }
        )
        ausencias.push(ausencia);
    }
    return ausencias;
}


/**
     * Valida la correctitud de un ausentismo definido en relacion a los indicadores
     * calculados. Actualmente se valida:
     *             - Que el ausentismo no se solape con otras ausencias previas
     *             - Que los indicadores no excedan los dias disponibles de licencia
     *             - Que existan indicadores para el caso de las licencias 
     * @param ausentismo 
     * @param indicadores 
     * @param ausToUpdate Opcional. Requerido en la actualizacion de un ausentismo
     */
    export async function validateAusentismo(ausentismo, indicadores, ausToUpdate?){
        let warnings = [];
        warnings = warnings.concat(this.checkDiasLicencia(ausentismo, indicadores));
        warnings = warnings.concat(utils.formatWarningsIndicadores(await this.checkMaxDiasDisponibles(indicadores)));
        warnings = warnings.concat(utils.formatWarningsSuperposicion(await this.checkSolapamientoPeriodos(ausentismo.agente, ausentismo.articulo, ausentismo.fechaDesde, ausentismo.fechaHasta, ausToUpdate)));
        return warnings;
    }

    /**
     * Idem validateAusentismo. Realiza algunas validaciones similares pero
     * utiles solo cuando se sugieren los dias de ausencia. 
     * No utilizar ni al momento de cargar o editar licencias.
     * @param ausNewValues 
     * @param ausentismoCalculado 
     * @param indicadores 
     * @param ausToUpdate 
     */
    export async function validateAusentismoSugerencia(ausNewValues, ausentismoCalculado, indicadores, ausToUpdate?){
        let warnings = [];
        warnings = warnings.concat(utils.formatWarningsIndicadores(await this.checkIndicadoresSugerencia(indicadores, ausNewValues.fechaDesde)));
        warnings = warnings.concat(utils.formatWarningsSuperposicion(await this.checkSolapamientoPeriodos(ausNewValues.agente, ausNewValues.articulo, ausentismoCalculado.desde, ausentismoCalculado.hasta, ausToUpdate)));
        return warnings;
    }


    /**
     * Utilidad para copiar los valores de un objeto ausentismo a otro objeto
     * @param ausToUpdate 
     * @param ausNewValues 
     */
    export  function applyChanges(ausToUpdate, ausNewValues){
        ausToUpdate.fechaDesde = ausNewValues.fechaDesde;
        ausToUpdate.fechaHasta = ausNewValues.fechaHasta;
        ausToUpdate.cantidadDias = ausNewValues.cantidadDias;
        ausToUpdate.ausencias = ausNewValues.ausencias;
        ausToUpdate.observacion = ausNewValues.observacion;
        ausToUpdate.adicional = ausNewValues.adicional;
        ausToUpdate.extra = ausNewValues.extra;
        // adjuntos: Array,
        // certificado: CertificadoSchema,
        // ausencias: [AusenciaSchema]
        return ausToUpdate;
    }

    export function checkDiasLicencia(ausentismo, indicadores){
        let warnings = [];
        if (ausentismo.articulo.descuentaDiasLicencia &&
            (!indicadores || !indicadores.length)){
            warnings = warnings.concat(`No se encontró información sobre días disponibles! Consulte con el Administrador del Sistema.`);
        }
        return warnings;
    }

    export function checkMaxDiasDisponibles(indicadores){
        let indicadoresConProblemas = [];
        for (const indicador of indicadores){
            let intervaloConProblemas:any;
            for (const intervalo of indicador.intervalos){
                if ( intervalo.totales ){
                    const diasDisponibles = intervalo.totales - intervalo.ejecutadas;
                    const restoDiasDisponibles = diasDisponibles - intervalo.asignadas;
                    if( intervalo.totales && restoDiasDisponibles < 0) {
                        intervaloConProblemas = intervalo;
                        break;
                    }
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
     * Busca ausencias previas existentes en un periodo determinado para un agente.
     * El parametro ausentismo se utiliza unicamente en el caso que se este en modo 
     * edicion, para evitar controlar con el mismo ausentismo que se esta editando
     * @param agente 
     * @param articulo 
     * @param desde 
     * @param hasta 
     * @param ausentismo Opcional. Unicamente necesario en modo edicion
     */
    export async function checkSolapamientoPeriodos(agente, articulo, desde, hasta, ausentismo?){
        let ausentismos = await AusenciaPeriodo.find({
            'agente._id': agente._id,
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
            ausentismos = ausentismos.filter(au => !au._id.equals(ausentismo._id));
        }
        return ausentismos;
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
     * @param ausentismo Opcional.
     */
    export function checkIndicadoresSugerencia(indicadores, fechaInteres, ausentismo?){
        let indicadoresConProblemas = [];
        for (const indicador of indicadores){
            let intervaloConProblemas:any;
            for (const intervalo of indicador.intervalos){
                if (intervalo.totales && (!intervalo.hasta || (intervalo.hasta >= fechaInteres))) {
                    const diasDisponibles = intervalo.totales - intervalo.ejecutadas;
                    if( diasDisponibles < 0) {
                        intervaloConProblemas = intervalo;
                    }
                    break;
                }
                // if (!intervalo.limiteAusencias || !intervalo.hasta || (intervalo.hasta >= fechaInteres)) {
                //     const diasDisponibles = intervalo.totales - intervalo.ejecutadas;
                //     if( diasDisponibles < 0) {
                //         intervaloConProblemas = intervalo;
                //     }
                //     break;
                // }
            }
            if (intervaloConProblemas){
                indicador.intervalos = [intervaloConProblemas];
                indicadoresConProblemas.push(indicador)
            }     
        }
        return indicadoresConProblemas;
    } 