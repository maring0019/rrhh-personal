import { Types } from 'mongoose';
import { Agente } from '../schemas/agente';

import { Readable } from 'stream';
// import { Base64Encode } from 'base64-stream';
import { makeFs } from '../../../core/tm/schemas/imagenes';


async function getAgentes(req, res, next){
    try {
        let query = Agente.find({});
        if (req.query.nombre) {
            query.where('nombre').equals(RegExp('^.*' + req.query.nombre + '.*$', 'i'));
        }
        let agentes = await query.sort({ nombre: 1 }).exec();
        return res.json(agentes);
    } catch (err) {
        return next(err);
    }
}

// TODO Implementar testing
async function getAgenteByID(req, res, next){
    console.log('Busqueda por ID!!!');
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) return res.status(404).send();
        let agente:any = await Agente.findById(id);
        if (!agente) return res.status(404).send();
        return res.json(agente);
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

/**
 * Valida que un agente tenga todos los atributos requeridos
 * Si falta algun atributo o valor, retorna un array con el/los nombre/s del
 * atributo faltante, caso contrario si esta todo ok, retorna un array vacio
 * @param agente obj a validar
 */
function validateAgenteAttributes(agente):String[]{
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
async function findAgente(agente):Promise<any>{
    const attrFaltantes = (AgenteController.validateAgenteAttributes(agente));
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

function isEmpty(obj){
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

async function addAgente(req, res, next){
    try {
        console.log('ALTA AGENTE!!!');
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
            // TODO Test
            contactos: req.body.contactos,
            educacion: req.body.educacion,
            historiaLaboral: req.body.historiaLaboral,
        });
        // Con el objetivo de facilitar el testing de funciones que invocan
        // otras funciones internas dentro del mismo modulo es que se realiza
        // la llamada a findAgente de la siguiente manera
        // https://github.com/facebook/jest/issues/936
        // https://medium.com/@qjli/how-to-mock-specific-module-function-in-jest-715e39a391f4
        // https://medium.com/@DavideRama/mock-spy-exported-functions-within-a-single-module-in-jest-cdf2b61af642
        const agenteExistente = await AgenteController.findAgente(agente);
        if (isEmpty(agenteExistente)){
            const agenteNuevo = await agente.save();
            if (req.body.foto){
                await AgenteController.saveImage(req, res, req.body.foto, agenteNuevo);
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
            // agente.historiaLaboral= req.body.historiaLaboral,
            // agente.situacionLaboral= req.body.situacionLaboral
        
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



async function saveImage(req, res, imagen, agente){
    // Se eliminan las fotos anteriores si es necesario
    const agenteFotoModel = makeFs();
    const fotosPrevias = await agenteFotoModel.find({ 'metadata.agenteID': agente._id });
    fotosPrevias.forEach(foto => {
        foto.unlink((error, unlinkedAttachment) => { });
    });
    // Se almacena la nueva imagen
    var stream = new Readable();
    var buffer = Buffer.from(imagen, 'base64');
    stream.push(buffer);
    stream.push(null);
    
    const options = ({
            filename: 'fotoCredencialNueva.jpg',
            contentType: 'image/jpg',
            metadata: {
                agenteID: agente._id
            }
        });
    agenteFotoModel.write(options, stream, (error, file) => { });
}


async function getImage(req, res, next){
        const id = req.params.id;
        const fotoAgenteModel = makeFs();
        
        const fotos = await fotoAgenteModel.find({ 'metadata.agenteID': new Types.ObjectId(id) });
        if (fotos.length>0){
            const foto = fotos[0];
            foto.read((err, buffer) => {
                if (err) {
                    console.log('ERROR!!')
                    return next(err);
                }
                res.setHeader('Content-Type', foto.contentType);
                res.setHeader('Content-Length', foto.length);
                return res.send(buffer.toString('base64'));
            });
        }
        else{
            return res.send(null);
        }
        
}




const AgenteController = {
    getAgentes,
    addAgente,
    updateAgente,
    deleteAgente,
    getAgenteByID,
    getImage,
    findAgente,
    searchAgentes,
    saveImage,
    validateAgenteAttributes,
    isEmpty
};

export default AgenteController;
