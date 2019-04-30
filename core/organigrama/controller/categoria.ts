import { Categoria } from '../schemas/categoria';

export async function getCategoriaById(req, res, next) {
    try {
        let categoria = await Categoria.findById(req.params.id);
        return res.json(categoria);
    } catch (err) {
        return next(err);
    }
}

export async function getCategoria(req, res, next) {
    try {
        let query = Categoria.find({});
        if (req.query.nombre) {
            query.where('nombre').equals(RegExp('^.*' + req.query.nombre + '.*$', 'i'));
        }
        let categoria = await query.sort({ nombre: 1 }).exec();
        return res.json(categoria);
    } catch (err) {
        return next(err);
    }
}


export async function addCategoria(req, res, next) {
    try {
        const categoria = new Categoria({
            nombre: req.body.nombre
        });
        const categoriaNueva = await categoria.save();
        return res.json(categoriaNueva);
    } catch (err) {
        return next(err);
    }
}