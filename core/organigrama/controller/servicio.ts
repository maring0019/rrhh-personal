import { Servicio } from '../schemas/servicio';

export async function getServicioById(req, res, next) {
    try {
        let servicio = await Servicio.findById(req.params.id);
        return res.json(servicio);
    } catch (err) {
        return next(err);
    }
}

export async function getServicio(req, res, next) {
    try {
        let query = Servicio.find({});
        if (req.query.nombre) {
            query.where('nombre').equals(RegExp('^.*' + req.query.nombre + '.*$', 'i'));
        }
        let servicio = await query.sort({ nombre: 1 }).exec();
        return res.json(servicio);
    } catch (err) {
        return next(err);
    }
}


export async function addServicio(req, res, next) {
    try {
        const servicio = new Servicio({
            nombre: req.body.nombre,
            jefe: req.body.jefe,
            departamento: req.body.departamento,
            ubicacion: req.body.ubicacion,
            codigo: req.body.codigo,
            nombreViejo: req.body.nombreViejo
        });
        const servicioNuevo = await servicio.save();
        return res.json(servicioNuevo);
    } catch (err) {
        return next(err);
    }
}