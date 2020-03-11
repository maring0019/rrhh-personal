import BaseController from '../../../core/app/basecontroller';
import { Types } from 'mongoose';

import { Articulo } from '../schemas/articulo';
import { AusenciaPeriodo } from '../schemas/ausenciaperiodo';

class ArticuloController extends BaseController {

    /**
     * Actualiza los datos de un articulo existente, y posteriormente
     * se intenta actualizar en forma masiva todas las referencias al
     * color del articulo en los objetos AusenciaPeriodo para que se
     * visualicen correctamente por ejemplo en el calendario.
     */
    async update(req, res, next) {
        try {
            const id = req.params.id;
            if (!id || (id && !Types.ObjectId.isValid(id))) return res.status(404).send();
            let objToUpdate:any = await Articulo.findById(id);
            if (!objToUpdate) return res.status(404).send({ message:"Not found"});
            let objWithChanges = req.body;
            await objToUpdate.updateOne({ $set: objWithChanges });
            await AusenciaPeriodo.updateMany(
                { 'articulo._id' : Types.ObjectId(objToUpdate._id) },
                { $set: { 'articulo.color' : objWithChanges.color } } 
            )
            return res.json(objToUpdate);
        } catch (err) {
            return next(err);
        }
    }

}

export default ArticuloController; 