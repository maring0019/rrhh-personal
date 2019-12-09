import BaseController from "../../../core/app/basecontroller";
import { Guardia } from "../schemas/guardia";

class GuardiaController extends BaseController {

    constructor(model) {
        super(model);
        // this.guardar = this.guardar.bind(this);
        this.confirmar = this.confirmar.bind(this);
        // this.editar = this.editar.bind(this);
    }

    // Posibles estados de la guardia (planilla)
    ESTADO_SIN_CONFIRMAR = 0;
    ESTADO_CONFIRMADA = 1;
    ESTADO_VALIDADA = 2;

    
    async add(req, res, next) {
        // Alta de una guardia
        try {
            let obj = req.body;
            obj.fechaEntrega = new Date();
            obj.estado = this.ESTADO_SIN_CONFIRMAR;
            let object = new Guardia(obj);
            const objNuevo = await object.save();
            return res.json(objNuevo);
        } catch (err) {
            return next(err);
        }
    }

    async confirmar(req, res, next){
        return await this.save(req, res, next, this.ESTADO_CONFIRMADA);
    }

    async validar(req, res, next){
        return await this.save(req, res, next, this.ESTADO_VALIDADA);
    }

    async save(req, res, next, estadoGuardia){

    }


}

export default GuardiaController; 
