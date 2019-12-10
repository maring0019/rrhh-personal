import BaseController from "../../../core/app/basecontroller";
import { Guardia } from "../schemas/guardia";
import { Types } from "mongoose";

class GuardiaController extends BaseController {

    constructor(model) {
        super(model);
        this.addAndConfirmar = this.addAndConfirmar.bind(this);
        this.updateAndConfirmar = this.updateAndConfirmar.bind(this);
    }

    // Posibles estados de la guardia (planilla)
    ESTADO_SIN_CONFIRMAR = 0;
    ESTADO_CONFIRMADA = 1;
    ESTADO_VALIDADA = 2;

    
    async add(req, res, next) {
        return await this.saveAdd(req, res, next, this.ESTADO_SIN_CONFIRMAR);
    }

    async addAndConfirmar(req, res, next){
        return await this.saveAdd(req, res, next, this.ESTADO_CONFIRMADA);
    }

    async update(req, res, next){
        return await this.saveUpdate(req, res, next, this.ESTADO_SIN_CONFIRMAR);
    }

    async updateAndConfirmar(req, res, next){
        return await this.saveUpdate(req, res, next, this.ESTADO_CONFIRMADA);
    }


    /**
     * Helper utilizado por los metodos 'add', y 'addAndConfirmar'
     * Basicamente crea una guardia con el estado indicado por el
     * parametro estadoGuardia
     * @param estadoGuardia  
     */
    async saveAdd(req, res, next, estadoGuardia){
        try {
            let obj = req.body;
            obj.fechaEntrega = new Date();
            obj.estado = estadoGuardia;
            let object = new Guardia(obj);
            const objNuevo = await object.save();
            return res.json(objNuevo);
        } catch (err) {
            return next(err);
        }
    }


    /**
     * Helper utilizado por los metodos 'update', y 'updateAndConfirmar'
     * Basicamente guarda una guardia actualizando la fecha y su estado
     * segun lo indicado por el parametro estadoGuardia
     * @param estadoGuardia  
     */
    async saveUpdate(req, res, next, estadoGuardia){
        try {
            const id = req.params.id;
            if (!id || (id && !Types.ObjectId.isValid(id))) return res.status(404).send();
            let objToUpdate:any = await Guardia.findById(id);
            if (!objToUpdate) return res.status(404).send();
            let objWithChanges = req.body;
            objWithChanges.fechaEntrega = new Date();
            objWithChanges.estado = estadoGuardia;
            await objToUpdate.updateOne({ $set: objWithChanges });
            const objUpdated = await Guardia.findById(id);
            return res.json(objUpdated);
        } catch (err) {
            return next(err);
        }   
    }

}

export default GuardiaController; 
