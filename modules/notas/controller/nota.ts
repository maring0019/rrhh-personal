import BaseController from '../../../core/app/basecontroller';
import { Nota } from '../schemas/nota';


class NotaController extends BaseController {

    async add(req, res, next) {
        try {
            let obj = req.body;
            obj.usuario = this.getUser(req);// Append user
            let object = new Nota(obj);
            const objNuevo = await object.save();
            console.log("Objeto Creado", objNuevo);
            return res.json(objNuevo);
        } catch (err) {
            return next(err);
        }
    }


    async update(req, res, next) {
        try {
            let object:any = await this.getObject(req.params.id);
            if (!object) return res.status(404).send({ message: this.getMessageNotFound()});
            
            let objWithChanges = req.body;
            // Append user
            objWithChanges.usuario = this.getUser(req);
            await object.updateOne({ $set: objWithChanges });        
            let objUpdated = await this.getObject(req.params.id);
            return res.json(objUpdated);
        } catch (err) {
            return next(err);
        }
    }

    
}

export default NotaController;
