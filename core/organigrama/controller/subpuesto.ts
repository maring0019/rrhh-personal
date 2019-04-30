import { SubPuesto } from '../schemas/subpuesto';

export async function getSubPuestoById(req, res, next) {
    try {
        let subpuesto = await SubPuesto.findById(req.params.id);
        return res.json(subpuesto);
    } catch (err) {
        return next(err);
    }
}

export async function getSubPuesto(req, res, next) {
    try {
        let query = SubPuesto.find({});
        if (req.query.nombre) {
            query.where('nombre').equals(RegExp('^.*' + req.query.nombre + '.*$', 'i'));
        }
        let subpuesto = await query.sort({ nombre: 1 }).exec();
        return res.json(subpuesto);
    } catch (err) {
        return next(err);
    }
}


export async function addSubPuesto(req, res, next) {
    try {
        const subpuesto = new SubPuesto({
            nombre: req.body.nombre
        });
        const subpuestoNuevo = await subpuesto.save();
        return res.json(subpuestoNuevo);
    } catch (err) {
        return next(err);
    }
}