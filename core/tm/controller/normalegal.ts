import { TipoNormaLegal } from '../schemas/normaLegal';

export async function getTipoNormaLegalById(req, res, next) {
    try {
        let normaLegal = await TipoNormaLegal.findById(req.params.id);
        return res.json(normaLegal);
    } catch (err) {
        return next(err);
    }
}

export async function getTipoNormaLegal(req, res, next) {
    try {
        let query = TipoNormaLegal.find({});
        if (req.query.nombre) {
            query.where('nombre').equals(RegExp('^.*' + req.query.nombre + '.*$', 'i'));
        }
        let normaLegal = await query.sort({ nombre: 1 }).exec();
        return res.json(normaLegal);
    } catch (err) {
        return next(err);
    }
}


export async function addTipoNormaLegal(req, res, next) {
    try {
        const normaLegal = new TipoNormaLegal({
            nombre: req.body.nombre
        });
        const normaLegalNueva = await normaLegal.save();
        return res.json(normaLegalNueva);
    } catch (err) {
        return next(err);
    }
}