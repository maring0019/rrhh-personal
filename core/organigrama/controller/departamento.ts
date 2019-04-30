import { Departamento } from '../schemas/departamento';

export async function getDepartamentoById(req, res, next) {
    try {
        let departamento = await Departamento.findById(req.params.id);
        return res.json(departamento);
    } catch (err) {
        return next(err);
    }
}

export async function getDepartamento(req, res, next) {
    try {
        let query = Departamento.find({});
        if (req.query.nombre) {
            query.where('nombre').equals(RegExp('^.*' + req.query.nombre + '.*$', 'i'));
        }
        let departamento = await query.sort({ nombre: 1 }).exec();
        return res.json(departamento);
    } catch (err) {
        return next(err);
    }
}


export async function addDepartamento(req, res, next) {
    try {
        const departamento = new Departamento({
            nombre: req.body.nombre,
            jefe: req.body.jefe, // ID de un Agente
            ubicacion: req.body.ubicacion
        });
        const departamentoNuevo = await departamento.save();
        return res.json(departamentoNuevo);
    } catch (err) {
        return next(err);
    }
}