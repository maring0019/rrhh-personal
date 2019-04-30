import { Puesto } from '../schemas/puesto';

export async function getPuestoById(req, res, next) {
    try {
        let puesto = await Puesto.findById(req.params.id);
        return res.json(puesto);
    } catch (err) {
        return next(err);
    }
}

export async function getPuesto(req, res, next) {
    try {
        let query = Puesto.find({});
        if (req.query.nombre) {
            query.where('nombre').equals(RegExp('^.*' + req.query.nombre + '.*$', 'i'));
        }
        let puesto = await query.sort({ nombre: 1 }).exec();
        return res.json(puesto);
    } catch (err) {
        return next(err);
    }
}


export async function addPuesto(req, res, next) {
    try {
        const puesto = new Puesto({
            nombre: req.body.nombre
        });
        const puestoNuevo = await puesto.save();
        return res.json(puestoNuevo);
    } catch (err) {
        return next(err);
    }
}