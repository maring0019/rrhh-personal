import { Ausencia } from '../schemas/ausencia';
import { AusenciaPeriodo } from '../schemas/ausenciaPeriodo';

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

export async function addAusenciasPeriodo(req, res, next) {
    try {
        const periodo = new AusenciaPeriodo({
            agente: req.body.agente, 
            articulo: req.body.articulo,
            fechaDesde: req.body.fechaDesde,
            fechaHasta: req.body.fechaHasta,
            cantidadDias: req.body.cantidadDias,
            observacion: req.body.observacion,
            certificado: req.body.certificado
        });
        let ausencias = generarAusencias(periodo);
        let result = await Ausencia.insertMany(ausencias);
        return res.json(result);
    } catch (err) {
        return next(err);
    }
}

export async function calcularAusencias(req, res, next){

}

export function generarAusencias(ausenciaPeriodo){
    let ausencias = [];
    let fecha:Date = ausenciaPeriodo.fechaDesde;
    for (let i = 0; i < ausenciaPeriodo.cantidadDias ; i++) {
        const ausencia = new Ausencia({
            agente: ausenciaPeriodo.agente, 
            fecha: fecha,
            articulo: ausenciaPeriodo.articulo,
            observacion: ausenciaPeriodo.observacion
            }
        )
        ausencias.push(ausencia);
        let tomorrow = new Date(fecha);
        fecha = new Date(tomorrow.setDate(tomorrow.getDate() + 1));
        }
    return ausencias;
}


export async function validateAusencias(ausenciaPeriodo) {
    return true;
}


