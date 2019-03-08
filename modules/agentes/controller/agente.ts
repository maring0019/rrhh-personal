import { Types } from 'mongoose';
import { Agente } from '../schemas/agente';


async function getAgentes(req, res, next){
    try {
        let query = Agente.find({});
        if (req.query.nombre) {
            query.where('nombre').equals(RegExp('^.*' + req.query.nombre + '.*$', 'i'));
        }
        let situaciones = await query.sort({ nombre: 1 }).exec();
        return res.json(situaciones);
    } catch (err) {
        return next(err);
    }
}
    
function existsAgente(){
    return false;
}

async function addAgente(req, res, next){
    try {
        // Con el objetivo de facilitar el testing de funciones que invocan
        // otras funciones internas dentro del mismo modulo es que se realiza
        // la llamada a existsAgente de la siguiente manera
        // https://github.com/facebook/jest/issues/936
        // https://medium.com/@qjli/how-to-mock-specific-module-function-in-jest-715e39a391f4
        // https://medium.com/@DavideRama/mock-spy-exported-functions-within-a-single-module-in-jest-cdf2b61af642
        if (!AgenteController.existsAgente()){
            const agente = new Agente({
                documento: req.body.documento,
                cuil: req.body.cuil,
                nombre: req.body.nombre,
                apellido: req.body.apellido
            });
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
    existsAgente,
};

export default AgenteController;
