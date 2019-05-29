import { Types } from 'mongoose';
import { Provincia } from '../schemas/provincia';

export async function getProvinciaById(req, res, next) {
    try {
        let obj = await Provincia.findById(req.params.id);
        return res.json(obj);
    } catch (err) {
        return next(err);
    }
}

export async function getProvincias(req, res, next) {
    try {
        let query = Provincia.find({});
        if (req.query.nombre) {
            query.where('nombre').equals(RegExp('^.*' + req.query.nombre + '.*$', 'i'));
        }
        if (req.query.pais) {
            query.where('pais._id').equals(Types.ObjectId(req.query.pais));
        }
        let objs = await query.sort({ nombre: 1 }).exec();
        return res.json(objs);
    } catch (err) {
        return next(err);
    }
}


export async function addProvincia(req, res, next) {
    try {
        const obj = new Provincia({
            nombre: req.body.nombre,
            pais: req.body.pais
        });
        const objNuevo = await obj.save();
        return res.json(objNuevo);
    } catch (err) {
        return next(err);
    }
}
