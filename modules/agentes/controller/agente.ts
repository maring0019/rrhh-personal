import { Types } from 'mongoose';
import jimp = require("jimp")

import { Readable } from 'stream';

import { Agente } from '../schemas/agente';

import { makeFs } from '../../../core/tm/schemas/imagenes';
import { attachFilesToObject } from '../../../core/files/controller/file'
import { AusenciaPeriodo } from '../../ausentismo/schemas/ausenciaPeriodo';

async function getAgentes(req, res, next){
    console.log('Buscando Agente')
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
        console.log('Searching...' + req.query.cadenaInput)
        let query = Agente.find({$text: { $search: req.query.cadenaInput }});
        let agentes = await query.exec();
        return res.json(agentes);
    } catch (err) {
        return next(err);
    }
}

async function addAgente(req, res, next){
    try {
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
            // TODO Test insert de estas relaciones
            contactos: req.body.contactos,
            educacion: req.body.educacion,
            situacionLaboral: req.body.situacionLaboral,
            historiaLaboral: req.body.historiaLaboral,
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
                await AgenteController._saveImage(req.body.foto, agenteNuevo._id);
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
        agente.historiaLaboral= req.body.historiaLaboral;

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
        if (!situacion) return res.status(404).send("Not found");
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
        if (!agente) return res.status(404).send("Not found");
        let baja = req.body;
        agente.activo = false;
        agente.bajas.push(baja);
        let agenteActualizado = await agente.save();
        return res.json(agenteActualizado);
    } catch (err) {
        return next(err);
    }
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
            { $match: { 'agente.id': Types.ObjectId(agente.id) } },
            { $unwind: '$ausencias'},
            // { $sort : { 'ausencias.fecha' : 1 } }
        ]
        // let ausencias = await Ausencia.find({ 'agente.id': new Types.ObjectId(agente.id)}).sort({ fecha: 1 }).exec();
        let ausencias = await AusenciaPeriodo.aggregate(pipeline)
        return res.json(ausencias);
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

async function _saveImage(imagen, agenteID){
    // Se eliminan las fotos anteriores si es necesario
    const agenteFotoModel = makeFs();
    const fotosPrevias = await agenteFotoModel.find({ 'metadata.agenteID': agenteID });
    fotosPrevias.forEach(foto => {
        agenteFotoModel.unlinkById(foto._id, (error, unlinkedAttachment) => { });
    });
    // Remove extra data if necesary
    // imagen = imagen.toString().replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
    let buffer = Buffer.from(imagen, 'base64');
    let jimage = await jimp.read(buffer);
    jimage.resize(256, jimp.AUTO).quality(90); // Resize and set JPEG quality
    buffer = await jimage.getBufferAsync(jimp.MIME_JPEG);
    
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
        console.log('Agente Encontrado!!!');
        console.log(agente.nombre);
        const result = await attachFilesToObject([], agente);
        return res.json(result);
    } catch (err) {
        console.log('Estamos atrapando el error!!')
        return next(err);
    }
}






const AgenteController = {
    getAgentes,
    addAgente,
    bajaAgente,
    updateAgente,
    deleteAgente,
    searchAgentes,
    getAgenteByID,
    getFotoPerfil,
    getAusencias,
    uploadFotoPerfil,
    uploadFilesAgente,
    _findFotoPerfil,
    _findAgente,
    _saveImage,
    _validateAgenteAttributes,
    _isEmpty
};

export default AgenteController;
