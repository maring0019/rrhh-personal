import BaseController from "../../app/basecontroller";

class RegimenHorarioController extends BaseController {}

export default RegimenHorarioController; 


// import { Types } from 'mongoose';
// import { RegimenHorario } from '../schemas/regimenhorario';


// export async function getRegimenHorario(req, res, next) {
//     try {
//         let query = RegimenHorario.find({});
//         if (req.query.nombre) {
//             // query.where('nombre').equals(RegExp('^.*' + req.query.nombre + '.*$', 'i'));
//             query.where('nombre').equals(req.query.nombre);
//         }
//         let regimenHorarios = await query.sort({ nombre: 1 }).exec();
//         return res.json(regimenHorarios);
//     } catch (err) {
//         return next(err);
//     }
// }


// export async function addRegimenHorario(req, res, next) {
//     try {
//         const regimenHorario = new RegimenHorario({
//             nombre: req.body.nombre
//         });
//         const regimenHorarioNuevo = await regimenHorario.save();
//         return res.json(regimenHorarioNuevo);
//     } catch (err) {
//         return next(err);
//     }
// }

// export async function updateRegimenHorario(req, res, next) {
//     try {
//         const id = req.params.id;
//         if (!id || (id && !Types.ObjectId.isValid(id))) return next(404);
//         let regimenHorario:any = await RegimenHorario.findById(id);
//         if (!regimenHorario) return next(404);
//         regimenHorario.nombre = req.body.nombre;
//         regimenHorario.requiereVencimiento = req.body.requiereVencimiento;
//         const regimenHorarioActualizada = await regimenHorario.save();
//         return res.json(regimenHorarioActualizada);
//     } catch (err) {
//         return next(err);
//     }
// }

// export async function deleteRegimenHorario(req, res, next) {
//     try {
//         const id = req.params.id;
//         if (!id || (id && !Types.ObjectId.isValid(id))) return next(404);
//         let regimenHorario:any = await RegimenHorario.findById(id);
//         if (!regimenHorario) return next(404);
//         const regimenHorarioEliminada = await regimenHorario.remove();
//         return res.json(regimenHorarioEliminada);
//     } catch (err) {
//         return next(err);
//     }
// }