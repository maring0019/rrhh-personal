import { Types } from 'mongoose';
import { Provincia } from '../schemas/provincia';

export async function getProvinciaById(req, res, next) {
    try {
        let provincia = await Provincia.findById(req.params.id);
        return res.json(provincia);
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
        let provincias = await query.sort({ nombre: 1 }).exec();
        return res.json(provincias);
    } catch (err) {
        return next(err);
    }
}
