import { Types } from 'mongoose';
import { Situacion } from '../schemas/situacion';


export async function getSituaciones(req, res, next) {
    try {
        let query = Situacion.find({});
        if (req.query.nombre) {
            query.where('nombre').equals(RegExp('^.*' + req.query.nombre + '.*$', 'i'));
        }
        let situaciones = await query.sort({ nombre: 1 }).exec();
        return res.json(situaciones);
    } catch (err) {
        return next(err);
    }
}


export async function addSituacion(req, res, next) {
    try {
        const situacion = new Situacion({
            nombre: req.body.nombre,
            requiereVencimiento: req.body.requiereVencimiento
        });
        const situacionNueva = await situacion.save();
        return res.json(situacionNueva);
    } catch (err) {
        return next(err);
    }
}

export async function updateSituacion(req, res, next) {
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) return res.status(404).send();
        let situacion:any = await Situacion.findById(id);
        if (!situacion) return res.status(404).send();
        situacion.nombre = req.body.nombre;
        situacion.requiereVencimiento = req.body.requiereVencimiento;
        const situacionActualizada = await situacion.save();
        return res.json(situacionActualizada);
    } catch (err) {
        return next(err);
    }
}

export async function deleteSituacion(req, res, next) {
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) return res.status(404).send();
        let situacion:any = await Situacion.findById(id);
        if (!situacion) return res.status(404).send("Not found");
        const situacionEliminada = await situacion.remove();
        return res.json(situacionEliminada);
    } catch (err) {
        return next(err);
    }
}