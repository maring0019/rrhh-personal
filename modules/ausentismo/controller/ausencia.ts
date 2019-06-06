import { Ausencia } from '../schemas/ausencia';

export async function getAusenciaById(req, res, next) {
    try {
        let obj = await Ausencia.findById(req.params.id);
        return res.json(obj);
    } catch (err) {
        return next(err);
    }
}

// TODO Revisar parametros de consulta
export async function getAusencias(req, res, next) {
    try {
        let query = Ausencia.find({});
        if (req.query.nombre) {
            query.where('nombre').equals(RegExp('^.*' + req.query.nombre + '.*$', 'i'));
        }
        let objs = await query.sort({ nombre: 1 }).exec();
        return res.json(objs);
    } catch (err) {
        return next(err);
    }
}


export async function addAusencia(req, res, next) {
    console.log('Agregando Ausencia!!');
    try {
        const obj = new Ausencia({
            agente: req.body.agente, 
            fecha: req.body.fecha,
            articulo: req.body.articulo,
            observacion: req.body.observacion,
            adicional: req.body.adicional,
            extra: req.body.extra,
            adjuntos: req.body.adjuntos,
            certificado: req.body.certificado
        });
        const objNuevo = await obj.save();
        return res.json(objNuevo);
    } catch (err) {
        return next(err);
    }
}
