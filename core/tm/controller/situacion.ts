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
        let situacionNueva = new Situacion(req.body);
        await situacionNueva.save();
        res.json(situacionNueva);
    } catch (err) {
        return next(err);
    }
}

export async function updateSituacion(req, res, next) {
    try {
        const id = req.params.id;
        if (id && !Types.ObjectId.isValid(id)) res.status(404).send("Not found");
        let situacion:any = await Situacion.findById(id);
        if (!situacion) res.status(404).send("Not found");
        situacion.nombre = req.body.nombre;
        situacion.requiereVencimiento = req.body.requiereVencimiento;
        await situacion.save();
        return res.json(situacion);
    } catch (err) {
        return next(err);
    }
}

export async function deleteSituacion(req, res, next) {
    try {
        const id = req.params.id;
        if (id && !Types.ObjectId.isValid(id)) res.status(404).send("Not found");
        let situacion:any = await Situacion.findById(id);
        if (!situacion) res.status(404).send("Not found");
        await situacion.remove();
        return res.json(situacion);
    } catch (err) {
        return next(err);
    }

}

