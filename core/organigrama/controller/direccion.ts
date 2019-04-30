import { Direccion } from '../schemas/direccion';

export async function getDireccionById(req, res, next) {
    try {
        let direccion = await Direccion.findById(req.params.id);
        return res.json(direccion);
    } catch (err) {
        return next(err);
    }
}

export async function getDireccion(req, res, next) {
    try {
        let query = Direccion.find({});
        if (req.query.nombre) {
            query.where('nombre').equals(RegExp('^.*' + req.query.nombre + '.*$', 'i'));
        }
        let direccion = await query.sort({ nombre: 1 }).exec();
        return res.json(direccion);
    } catch (err) {
        return next(err);
    }
}


export async function addDireccion(req, res, next) {
    try {
        const direccion = new Direccion({
            nombre: req.body.nombre,
            jefe: req.body.jefe, // Es un nombre completo (preguntar porque no es un agente)
            ubicacion: req.body.ubicacion
        });
        const direccionNueva = await direccion.save();
        return res.json(direccionNueva);
    } catch (err) {
        return next(err);
    }
}