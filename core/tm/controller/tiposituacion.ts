import { Types } from 'mongoose';
import { TipoSituacion } from '../schemas/tiposituacion';


export async function getTipoSituaciones(req, res, next) {
    try {
        let query = TipoSituacion.find({});
        if (req.query.nombre) {
            query.where('nombre').equals(RegExp('^.*' + req.query.nombre + '.*$', 'i'));
        }
        let situaciones = await query.sort({ nombre: 1 }).exec();
        return res.json(situaciones);
    } catch (err) {
        return next(err);
    }
}


export async function addTipoSituacion(req, res, next) {
    try {
        const situacion = new TipoSituacion({
            nombre: req.body.nombre,
            requiereVencimiento: req.body.requiereVencimiento
        });
        const situacionNueva = await situacion.save();
        return res.json(situacionNueva);
    } catch (err) {
        return next(err);
    }
}

export async function updateTipoSituacion(req, res, next) {
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) return next(404);
        let situacion:any = await TipoSituacion.findById(id);
        if (!situacion) return next(404);
        situacion.nombre = req.body.nombre;
        situacion.requiereVencimiento = req.body.requiereVencimiento;
        const situacionActualizada = await situacion.save();
        return res.json(situacionActualizada);
    } catch (err) {
        return next(err);
    }
}

export async function deleteTipoSituacion(req, res, next) {
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) return next(404);
        let situacion:any = await TipoSituacion.findById(id);
        if (!situacion) return next(404);
        const situacionEliminada = await situacion.remove();
        return res.json(situacionEliminada);
    } catch (err) {
        return next(err);
    }
}