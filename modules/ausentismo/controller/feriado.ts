import { Feriado } from '../schemas/feriado';
import * as utils from '../commons/utils';

import BaseController from '../../../core/app/basecontroller';

class FeriadoController extends BaseController {

    async add(req, res, next) {
        try {
            const obj = new Feriado({
                fecha: req.body.fecha? utils.parseDate(new Date(req.body.fecha)):null,
                descripcion: req.body.descripcion
            });
            const objNuevo = await obj.save();
            return res.json(objNuevo);
        } catch (err) {
            return next(err);
        }
    }
}

export default FeriadoController; 

// export async function getFeriadoById(req, res, next) {
//     try {
//         let obj = await Feriado.findById(req.params.id);
//         return res.json(obj);
//     } catch (err) {
//         return next(err);
//     }
// }

// export async function getFeriados(req, res, next) {
//     try {
//         let query = Feriado.find({});
//         if (req.query.fecha) {
//             const fecha = utils.parseDate(new Date(req.body.fecha));
//             query.where({ fecha: fecha });
//         }
//         let objs = await query.sort({ fecha: -1 }).exec();
//         return res.json(objs);
//     } catch (err) {
//         return next(err);
//     }
// }

// export async function searchFeriados(req, res, next){
//     console.log('serching feriados')
//     try { 
//         // let query = Agente.find({$text: { $search: req.query.cadenaInput }});
//         const params = aqp(req.query);
//         let agentes = await Feriado.find(params.filter).sort({fecha:1}).exec();
//         agentes = await Feriado.find({}).sort({fecha:-1}).exec();
//         return res.json(agentes);
//     } catch (err) {
//         return next(err);
//     }
// }


// export async function addFeriado(req, res, next) {
//     try {
//         const obj = new Feriado({
//             fecha: req.body.fecha? utils.parseDate(new Date(req.body.fecha)):null,
//             descripcion: req.body.descripcion
//         });
//         const objNuevo = await obj.save();
//         return res.json(objNuevo);
//     } catch (err) {
//         return next(err);
//     }
// }
