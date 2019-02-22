import { Pais } from '../schemas/pais';

export async function getPaisById(req, res, next) {
    try {
        let pais = await Pais.findById(req.params.id);
        return res.json(pais);
    } catch (err) {
        return next(err);
    }
}

export async function getPaises(req, res, next) {
    console.log('Quering paises');
    try {
        let query = Pais.find({});
        if (req.query.nombre) {
            query.where('nombre').equals(RegExp('^.*' + req.query.nombre + '.*$', 'i'));
        }
        let paises = await query.sort({ nombre: 1 }).exec();
        return res.json(paises);
    } catch (err) {
        return next(err);
    }
}
