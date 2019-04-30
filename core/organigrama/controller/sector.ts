import { Sector } from '../schemas/sector';

export async function getSectorById(req, res, next) {
    try {
        let sector = await Sector.findById(req.params.id);
        return res.json(sector);
    } catch (err) {
        return next(err);
    }
}

export async function getSector(req, res, next) {
    try {
        let query = Sector.find({});
        if (req.query.nombre) {
            query.where('nombre').equals(RegExp('^.*' + req.query.nombre + '.*$', 'i'));
        }
        let sector = await query.sort({ nombre: 1 }).exec();
        return res.json(sector);
    } catch (err) {
        return next(err);
    }
}


export async function addSector(req, res, next) {
    try {
        const sector = new Sector({
            nombre: req.body.nombre,
            jefe: req.body.jefe, // ID de un Agente
            servicio: req.body.servicio,
            ubicacion: req.body.ubicacion,
            nombreViejo: req.body.nombreViejo
        });
        const sectorNuevo = await sector.save();
        return res.json(sectorNuevo);
    } catch (err) {
        return next(err);
    }
}