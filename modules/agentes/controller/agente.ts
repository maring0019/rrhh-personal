import { Types } from 'mongoose';
import { Agente } from '../schemas/agente';


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

/**
 * Valida que un agente tenga todos los atributos requeridos
 * Si falta algun atributo o valor, retorna un array con el/los nombre/s del atributo
 * faltante, caso contrario si esta todo ok, retorna un array vacio
 * @param agente obj a validar
 */
function validateAgenteAttributes(agente):String[]{
    let objToCheck = agente;
    const attrRequeridos = ['documento', 'nombre', 'apellido', 'sexo', 'genero'];
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
        let situacion:any = await Agente.findById(id);
        if (!situacion) return res.status(404).send();
        situacion.nombre = req.body.nombre;
        situacion.requiereVencimiento = req.body.requiereVencimiento;
        const situacionActualizada = await situacion.save();
        return res.json(situacionActualizada);
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


const AgenteController = {
    getAgentes,
    addAgente,
    updateAgente,
    deleteAgente,
    findAgente,
    validateAgenteAttributes,
    isEmpty
};

export default AgenteController;
