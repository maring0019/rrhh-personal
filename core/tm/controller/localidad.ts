import { Types } from 'mongoose';
import { Localidad } from '../schemas/localidad';

export async function getLocalidadById(req, res, next) {
    try {
        let localidad = await Localidad.findById(req.params.id);
        return res.json(localidad);
    } catch (err) {
        return next(err);
    }
}

export async function getLocalidades(req, res, next) {
    try {
        let query = Localidad.find({});
        if (req.query.nombre) {
            query.where('nombre').equals(RegExp('^.*' + req.query.nombre + '.*$', 'i'));
        }
        if (req.query.provincia) {
            query.where('provincia._id').equals(Types.ObjectId(req.query.provincia));
        }
        //[TODO] Consultar que es este atributo
        // if (req.query.codigo) {
        //     query.where('codigoProvincia').equals(Number(req.query.codigo));
        // }
        let localidad = await query.sort({ nombre: 1 }).exec();
        return res.json(localidad);
    } catch (err) {
        return next(err);
    }
}
