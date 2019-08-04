import { Articulo } from '../schemas/articulo';


export async function addAgrupamiento(req, res, next) {
    try {
        const agrupamiento = new Articulo({
            nombre: req.body.nombre
        });
        const agrupamientoNuevo = await agrupamiento.save();
        return res.json(agrupamientoNuevo);
    } catch (err) {
        return next(err);
    }
}

export async function getArticuloById(req, res, next) {
    try {
        let obj = await Articulo.findById(req.params.id);
        return res.json(obj);
    } catch (err) {
        return next(err);
    }
}

export async function getArticulos(req, res, next) {
    try {
        let query = Articulo.find({});
        if (req.query.nombre) {
            query.where('nombre').equals(RegExp('^.*' + req.query.nombre + '.*$', 'i'));
        }
        if (req.query.codigo) {
            query.where('codigo').equals(RegExp('^.*' + req.query.codigo + '.*$', 'i'));
        }
        let objs = await query.sort({ nombre: 1 }).exec();
        return res.json(objs);
    } catch (err) {
        return next(err);
    }
}


export async function addArticulo(req, res, next) {
    console.log('Agregando Articulo!!');
    try {
        const obj = new Articulo({
            idInterno: req.body.idInterno,
            codigo: req.body.codigo,
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            grupo: req.body.grupo,
            limitado: req.body.limitado,
            requiereInformacionAdicional: req.body.requiereInformacionAdicional,
            tituloInformacionAdicional: req.body.tituloInformacionAdicional,
            codigoOTI: req.body.codigoOTI,
            formulas: req.body.formulas
        });
        const objNuevo = await obj.save();
        return res.json(objNuevo);
    } catch (err) {
        return next(err);
    }
}
