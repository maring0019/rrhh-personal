import { Educacion } from '../schemas/educacion';

export async function getEducacionById(req, res, next) {
    try {
        let educacion = await Educacion.findById(req.params.id);
        return res.json(educacion);
    } catch (err) {
        return next(err);
    }
}

export async function getEducacion(req, res, next) {
    try {
        let query = Educacion.find({});
        if (req.query.titulo) {
            query.where('titulo').equals(RegExp('^.*' + req.query.titulo + '.*$', 'i'));
        }
        let educacion = await query.sort({ titulo: 1 }).exec();
        return res.json(educacion);
    } catch (err) {
        return next(err);
    }
}


export async function addEducacion(req, res, next) {
    try {
        const educacion = new Educacion({
            tipoEducacion: req.body.tipoEducacion,
            titulo: req.body.titulo
            
        });
        const tituloNuevo = await educacion.save();
        return res.json(tituloNuevo);
    } catch (err) {
        return next(err);
    }
}