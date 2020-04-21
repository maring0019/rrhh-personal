import { Types } from 'mongoose';
import * as aqp from 'api-query-params';

import { Readable } from 'stream';

import { Agente } from '../schemas/agente';

import { makeFs } from '../../../core/tm/schemas/imagenes';
import { attachFilesToObject } from '../../../core/files/controller/file'
import { AusenciaPeriodo } from '../../ausentismo/schemas/ausenciaperiodo';
import { readImage } from '../../../core/files/utils';
import { IndicadorAusentismo } from '../../ausentismo/schemas/indicador';
import { SituacionLaboral } from '../schemas/situacionlaboral';

async function getAgentes(req, res, next){
    try {
        let query = Agente.find({});
        if (req.query.nombre) {
            query.where('nombre').equals(RegExp('^.*' + req.query.nombre + '.*$', 'i'));
        }
        if (req.query.numero) {
            query.where({ numero: req.query.numero });
        }

        let agentes = await query.sort({ nombre: 1 }).exec();
        return res.json(agentes);
    } catch (err) {
        return next(err);
    }
}

// TODO Implementar testing
async function getAgenteByID(req, res, next){
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) return next(404);
        let agente:any = await Agente.findById(id);
        if (!agente) return next(404);
        let foto = await AgenteController._findFotoPerfil(id);
        if (foto){
            foto.read((err, buffer) => {
                if (err) {
                    return res.json(agente);
                }
                agente.foto = buffer.toString('base64');
                return res.json(agente);
            });
        }
        else{
            return res.json(agente);
        }
    } catch (err) {
        return next(err);
    }
}

// TODO Implementar testing
async function searchAgentes(req, res, next){
    try { 
        const params = aqp(req.query);
        let agentes = await Agente.find(params.filter).sort({apellido:1}).exec();
        return res.json(agentes);
    } catch (err) {
        return next(err);
    }
}

async function addAgente(req, res, next){
    try {
        let historiaLaboral=[];
        let situacionLaboral = {...req.body.situacionLaboral};
        if (req.body.migracion){
            // Si viene este dato asumimos que es de la migracion y 
            // lo guardamos como viene al dato
            historiaLaboral = req.body.historiaLaboral;
        }
        else{
            // Sino viene el dato, se trata de un alta en el nuevo
            // sistema. La situacion laboral la marcamos como alta
            // Este dato será util al momento de cargar una nueva
            // historia laboral.
            situacionLaboral.esAlta = true;
            situacionLaboral.fecha = (situacionLaboral.normaLegal && situacionLaboral.normaLegal.fechaNormaLegal ) ? situacionLaboral.normaLegal.fechaNormaLegal: new Date();
        }
        const agente = new Agente({
            numero: req.body.numero,
            // tipoDocumento
            documento: req.body.documento,
            cuil: req.body.cuil,
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            estadoCivil: req.body.estadoCivil,
            sexo: req.body.sexo,
            genero: req.body.genero,
            fechaNacimiento: req.body.fechaNacimiento,
            nacionalidad: req.body.nacionalidad,
            direccion: req.body.direccion,
            contactos: req.body.contactos,
            educacion: req.body.educacion,
            situacionLaboral: situacionLaboral,
            historiaLaboral: historiaLaboral,
            bajas: req.body.bajas,
            activo: (req.body.activo==null || req.body.activo=='undefined')? true:req.body.activo
        });
        // Con el objetivo de facilitar el testing de funciones que invocan
        // otras funciones internas dentro del mismo modulo es que se realiza
        // la llamada a _findAgente de la siguiente manera
        // https://github.com/facebook/jest/issues/936
        // https://medium.com/@qjli/how-to-mock-specific-module-function-in-jest-715e39a391f4
        // https://medium.com/@DavideRama/mock-spy-exported-functions-within-a-single-module-in-jest-cdf2b61af642
        const agenteExistente = await AgenteController._findAgente(agente);
        if (_isEmpty(agenteExistente)){
            const agenteNuevo = await agente.save();
            if (req.body.foto){
                await AgenteController._saveImage(req.body.foto, agenteNuevo._id, req.body.migracion);
            }
            return res.json(agenteNuevo);
        }
        else{
            return next('El agente ingresado ya existe!');
        }
    } catch (err) {
        return next(err);
    }
}

async function updateAgente(req, res, next) {
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) return res.status(404).send();
        let agente:any = await Agente.findById(id);
        if (!agente) return res.status(404).send();
        agente.numero= req.body.numero;
        agente.documento= req.body.documento;
        agente.cuil= req.body.cuil;
        agente.nombre= req.body.nombre;
        agente.apellido= req.body.apellido;
        agente.estadoCivil= req.body.estadoCivil;
        agente.sexo= req.body.sexo;
        agente.genero= req.body.genero;
        agente.fechaNacimiento= req.body.fechaNacimiento;
        agente.nacionalidad= req.body.nacionalidad;
        agente.direccion= req.body.direccion;
        // TODO Test
        agente.contactos= req.body.contactos;
        agente.educacion= req.body.educacion;
        agente.situacionLaboral= req.body.situacionLaboral;
        // agente.historiaLaboral= req.body.historiaLaboral;

        const agenteActualizado = await agente.save();
        return res.json(agenteActualizado);
    } catch (err) {
        return next(err);
    }
}


async function deleteAgente(req, res, next) {
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) return res.status(404).send();
        let situacion:any = await Agente.findById(id);
        if (!situacion) return res.status(404).send({ message:"Not found" } );
        const situacionEliminada = await situacion.remove();
        return res.json(situacionEliminada);
    } catch (err) {
        return next(err);
    }
}


async function bajaAgente(req, res, next) {
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) return res.status(404).send();
        let agente:any = await Agente.findById(id);
        if (!agente) return res.status(404).send({message:"Agente not found"});
        let baja = req.body;
        agente.activo = false;
        // Antes de colocar la baja en el historial, guardamos
        // tambien la ultima situacion para que cronologicamente
        // quede registrado.
        moveSituacionLaboralToHistorial(agente, new SituacionLaboral());
        // Datos de la baja para el historial
        let nuevaHistoria = {
            tipo: 'baja',
            timestamp: new Date(),
            changeset: baja
        }
        agente.historiaLaboral.unshift(nuevaHistoria);
        let agenteActualizado = await agente.save(); // TODO Optimizar para solo actualizar la historiaLaboral?
        return res.json(agenteActualizado);
    } catch (err) {
        return next(err);
    }
}

async function reactivarAgente(req, res, next) {
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) return res.status(404).send();
        let agente:any = await Agente.findById(id);
        if (!agente) return res.status(404).send({message:"Agente not found"});
        agente.activo = true;
        let reactivacion = req.body;
        let nuevaHistoria = {
            tipo: 'reactivacion',
            timestamp: new Date(),
            changeset: reactivacion
        }
        agente.historiaLaboral.unshift(nuevaHistoria);
        let agenteActualizado = await agente.save();// TODO Optimizar para solo actualizar la historiaLaboral?
        return res.json(agenteActualizado);
    } catch (err) {
        return next(err);
    }
}


/**
 * Incorpora una nueva historia laboral, lo cual implica actualizar la
 * situacion laboral actual con la nueva historia laboral y guardar un
 * registro de la antigua situacion.
 * @param req 
 * @param res 
 * @param next 
 */
async function addHistorialLaboral(req, res, next){
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) return res.status(404).send();
        
        let agente:any = await Agente.findById(id);
        if (!agente) return res.status(404).send({message:"Agente not found"});
        let newSituacionLaboral = req.body;
        moveSituacionLaboralToHistorial(agente, newSituacionLaboral);
        let agenteActualizado = await agente.save();
        return res.json(agenteActualizado);
    } catch (err) {
        return next(err);
    }
}


/**
 * Mueve los datos de la situacion laboral modificada al historial
 * del agente. Ademas actualiza la situacion laboral actual con los
 * datos de la nueva situacion.
 * @param agente
 * @param newSituacionLaboral 
 */
function moveSituacionLaboralToHistorial(agente, newSituacionLaboral){
    let agenteCopy = agente.toObject();
    let oldSituacionLaboral = agenteCopy.situacionLaboral;
    // Ver como impacta en la migracion
    // Ver como impactan los nuevos datos de las bajas en la migracion
    // Ver como se visualizan un reporte completo con toda la historia laboral.
    // Ver como adjuntar los archivos por norma legal 
    // Ver como mostrar este historial en la app. y como editar si es necesario!!! FUCK FUCK FUCK
    // Definiciones:
    // Al dar de alta un usuario guardamos su situación como parte de la historia laboral
    //   * Agregar un atributo como situacionActual de tipo boolean
    
    agente.situacionLaboral.fecha = newSituacionLaboral.fecha;
    agente.situacionLaboral.motivo = newSituacionLaboral.motivo;
    agente.situacionLaboral.esAlta = false;
    agente.situacionLaboral.normaLegal = newSituacionLaboral.normaLegal;
    agente.situacionLaboral.situacion = newSituacionLaboral.situacion; 
    agente.situacionLaboral.cargo = newSituacionLaboral.cargo;
    agente.situacionLaboral.regimen = newSituacionLaboral.regimen;
    let nuevaHistoria = {
        tipo: oldSituacionLaboral.esAlta? 'alta' : 'modificacion',
        // fecha: (oldSituacionLaboral.normaLegal)? oldSituacionLaboral.normaLegal.fechaNormaLegal: null,
        timestamp: new Date(),
        changeset: { ...oldSituacionLaboral }
    }
    agente.historiaLaboral.unshift(nuevaHistoria);
}

async function uploadFotoPerfil(req, res, next){
    try {
        const id = req.params.id;
        const imagen = req.body.imagen;
        if (!id || (id && !Types.ObjectId.isValid(id))) return res.status(404).send();
        if (!imagen) return res.status(200).send();
        await AgenteController._saveImage(imagen, Types.ObjectId(id));        
        return res.status(200).send();

    }
    catch (err) {
        return next(err);
    }
}

async function getFotoPerfil(req, res, next){
        const id = req.params.id;
        const foto = await AgenteController._findFotoPerfil(id);
        if (foto){
            foto.read((err, buffer) => {
                if (err) {
                    console.log('ERROR!!')
                    return next(err);
                }
                else{
                    res.setHeader('Content-Type', foto.contentType);
                    res.setHeader('Content-Length', foto.length);
                    return res.send(buffer.toString('base64'));
                }
            });
        }
        else{
            return res.send(null);
        }
}

async function getAusencias(req, res, next){
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) return next(404);
        let agente:any = await Agente.findById(id);
        if (!agente) return next(404);
                
        const pipeline = [
            { $match: { 'agente._id': Types.ObjectId(agente._id) } },
            { $unwind: '$ausencias'}
        ]
        let ausencias = await AusenciaPeriodo.aggregate(pipeline)
        return res.json(ausencias);
    } catch (err) {
        return next(err);
    }
}


async function getAusenciasAsEvento(req, res, next){
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) return next(404);
        let agente:any = await Agente.findById(id);
        if (!agente) return next(404);
        
        // TODO: Aplicar algun filtro por anio o similar. Ahora por defecto
        // recupera la info en un periodo de un anio hacia atras y adelante
        const thisYear = (new Date()).getFullYear();
        const fechaHastaMax = new Date((thisYear + 1) + "-12-31");
        const fechaDesdeMin = new Date((thisYear - 5) + "-01-01") ;
        let matchFecha:any = { fechaHasta: { $gt: fechaDesdeMin }, fechaDesde: { $lt: fechaHastaMax}};
                
        const pipeline = [
            { $match: {
                ...{'agente._id': Types.ObjectId(agente._id) }, ...matchFecha }
            },
            { $unwind: '$ausencias'},
            { $project:
                {
                    _id: "$_id",
                    title: { $concat: ["ART. ", "$articulo.codigo"] },
                    start: { $dateToString: { date: "$ausencias.fecha", format:"%Y-%m-%d"}},
                    allDay: { $literal: true },
                    backgroundColor: "transparent",
                    textColor: { $ifNull: ['$articulo.color', '#002738'] },
                    type: "AUSENCIA",
                    ausentismoFechaDesde: { $dateToString: { date: "$fechaDesde", format:"%Y-%m-%dT00:00:00"}},
                    ausentismoFechaHasta: { $dateToString: { date: "$fechaHasta", format:"%Y-%m-%dT00:00:00"}},
                    startString: { $dateToString: { date: "$ausencias.fecha", format:"%Y-%m-%dT00:00:00"}}
                }
            }
        ]
        let ausencias = await AusenciaPeriodo.aggregate(pipeline)
        return res.json(ausencias);
    } catch (err) {
        return next(err);
    }
}


async function getLicenciasTotales(req, res, next){
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) return next(404);
        
        let agente:any = await Agente.findById(id);
        if (!agente) return next(404);
        
        const thisYear = new Date().getFullYear();
        const pipeline = [
            { $match: { 'agente._id': Types.ObjectId(agente._id), vigencia: { $gte: thisYear - 3 } }},
            { $unwind: '$intervalos'},
            { $match: { 'intervalos.totales': {  $nin: [ null, "" ] }}},
            { $group: { _id:null, totales: { $sum: "$intervalos.totales"}, ejecutadas: { $sum: "$intervalos.ejecutadas"} }}]
        let licenciasTotales = await IndicadorAusentismo.aggregate(pipeline)
        return res.json(licenciasTotales);
    } catch (err) {
        return next(err);
    }
}



/**
 * Valida que un agente tenga todos los atributos requeridos
 * Si falta algun atributo o valor, retorna un array con el/los nombre/s del
 * atributo faltante, caso contrario si esta todo ok, retorna un array vacio
 * @param agente obj a validar
 */
function _validateAgenteAttributes(agente):String[]{
    let objToCheck = agente;
    const attrRequeridos = ['documento', 'nombre', 'apellido', 'sexo'];
    let attrFaltantes = [];
    if (agente.hasOwnProperty('_doc')){
        objToCheck = agente._doc;
    }
    attrRequeridos.forEach(e => {
        if(!objToCheck.hasOwnProperty(e)){
            attrFaltantes.push(e);
        }
        else{
            if (typeof objToCheck[e] == 'undefined' || !objToCheck[e]){
                attrFaltantes.push(e);
            }
        }
    });
    return attrFaltantes;
}

/**
 * Realiza la busqueda de un agente específico. Basicamente determina la
 * existencia del mismo o no en la db. El agente que se proporciona como
 * parametro debe tener todos los atributos obligatorios para poder luego
 * determinar con precision si existe el agente. Si no se proveen todos
 * los atributos se arroja una excepcion indicando los atributos faltantes
 *
 * @param agente obj a determinar su existencia
 */
async function _findAgente(agente):Promise<any>{
    const attrFaltantes = (AgenteController._validateAgenteAttributes(agente));
    if ( attrFaltantes.length > 0 ){
        throw new Error(`Error: Faltan atributos requeridos. Verifique: ${attrFaltantes.join(', ')}`);
    }
    try {
        let query = Agente.findOne({ documento: agente.documento, nombre: agente.nombre,
            apellido: agente.apellido });
        const agentes = await query.exec();
        return agentes;
    } catch (err) {
        throw err;
    }
}

function _isEmpty(obj){
    return obj === null || undefined
    ? true
    : (() => {
            for (const prop in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                    return false;
                }
            }
            return true;
        })();
}

async function _findFotoPerfil(agenteID){
    if (agenteID){
        const fotoAgenteModel = makeFs();
        const fotos = await fotoAgenteModel.find({ 'metadata.agenteID': new Types.ObjectId(agenteID)});
        if (fotos.length>0) return fotos[0];
    }
    return null;

}

async function _saveImage(imagen, agenteID, migracion?){
    // Se eliminan las fotos anteriores si es necesario
    const agenteFotoModel = makeFs();
    const fotosPrevias = await agenteFotoModel.find({ 'metadata.agenteID': agenteID });
    fotosPrevias.forEach(foto => {
        agenteFotoModel.unlinkById(foto._id, (error, unlinkedAttachment) => { });
    });
    // Remove extra data if necesary. En la migracion no es necesario este pre-procesamiento
    if (!migracion) imagen = imagen.toString().replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
    
    let buffer = Buffer.from(imagen, 'base64');
    buffer = await readImage(buffer, {quality: 90, w: 256});
    let stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    const options = ({
            filename: 'fotoCredencialNueva.jpg',
            contentType: 'image/jpg',
            metadata: {
                agenteID: agenteID
            }
        });
    agenteFotoModel.write(options, stream, (error, file) => { });
}

async function uploadFilesAgente(req, res, next){
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) return next(404);
        let agente:any = await Agente.findById(id);
        if (!agente) return next(404);
        const result = await attachFilesToObject([], agente);
        return res.json(result);
    } catch (err) {
        console.log('Estamos atrapando el error!!')
        return next(err);
    }
}


    // Repasar todo el proceso
    // Ver como impacta en la migracion
    // Ver como impactan los nuevos datos de las bajas en la migracion
    // Ver como se visualizan un reporte completo con toda la historia laboral.
    // Ver como adjuntar los archivos por norma legal 
    // Ver como mostrar este historial en la app. y como editar si es necesario!!! FUCK FUCK FUCK



const AgenteController = {
    getAgentes,
    addAgente,
    bajaAgente,
    reactivarAgente,
    addHistorialLaboral,
    updateAgente,
    deleteAgente,
    searchAgentes,
    getAgenteByID,
    getFotoPerfil,
    getAusencias,
    getAusenciasAsEvento,
    getLicenciasTotales,
    uploadFotoPerfil,
    uploadFilesAgente,
    _findFotoPerfil,
    _findAgente,
    _saveImage,
    _validateAgenteAttributes,
    _isEmpty
};

export default AgenteController;
