import { Agrupamiento } from '../schemas/agrupamiento';

export async function getAgrupamientoById(req, res, next) {
    try {
        let agrupamiento = await Agrupamiento.findById(req.params.id);
        return res.json(agrupamiento);
    } catch (err) {
        return next(err);
    }
}

export async function getAgrupamientos(req, res, next) {
    try {
        let query = Agrupamiento.find({});
        if (req.query.nombre) {
            query.where('nombre').equals(RegExp('^.*' + req.query.nombre + '.*$', 'i'));
        }
        let agrupamiento = await query.sort({ nombre: 1 }).exec();
        return res.json(agrupamiento);
    } catch (err) {
        return next(err);
    }
}


export async function addAgrupamiento(req, res, next) {
    try {
        const agrupamiento = new Agrupamiento({
            nombre: req.body.nombre
        });
        const agrupamientoNuevo = await agrupamiento.save();
        return res.json(agrupamientoNuevo);
    } catch (err) {
        return next(err);
    }
}