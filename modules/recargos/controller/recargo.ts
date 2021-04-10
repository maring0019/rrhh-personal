import BaseController from "../../../core/app/basecontroller";
import { timestamp } from "../../../core/utils/dates";
import { Recargo } from "../schemas/recargo";
import { Types } from "mongoose";

class RecargoController extends BaseController {

    constructor(model) {
        super(model);
        this.addAndConfirmar = this.addAndConfirmar.bind(this);
        this.updateAndConfirmar = this.updateAndConfirmar.bind(this);
        this.updateAndProcesar = this.updateAndProcesar.bind(this);
        this.updateAndProcesarParcialmente = this.updateAndProcesarParcialmente.bind(this);
        this.updateAndHabilitarEdicion = this.updateAndHabilitarEdicion.bind(this);
    }

    getUser(req){
        const user = super.getUser(req);
        if (user) {
            return {
                _id: user.id,
                nombre: user.nombre,
                apellido: user.apellido
            }
        }
        return {};
    }

    // Posibles estados del recargo (planilla)
    ESTADO_SIN_CONFIRMAR = 0;
    ESTADO_CONFIRMADA = 1;
    ESTADO_PROCESADA_PARCIALMENTE = 2;
    ESTADO_PROCESADA = 3;

    async add(req, res, next) {
        const changeset = {
            estado: this.ESTADO_SIN_CONFIRMAR
        };
        return await this.saveAdd(req, res, next, changeset);
    }

    async addAndConfirmar(req, res, next){
        const changeset = {
            estado: this.ESTADO_CONFIRMADA
        };
        return await this.saveAdd(req, res, next, changeset);
    }

     /**
     * Helper utilizado por los metodos 'add', y 'addAndConfirmar'
     * Basicamente crea un recargo, aplicandole los valores enviados
     * en el changeset
     * @param changeset
     * TODO: Validar que el periodo sea unico
     */
    async saveAdd(req, res, next, changeset){
        try {
            let obj = req.body;
            obj = this.cleanObjectID(obj)
            obj.fechaHoraEntrega = timestamp();
            obj.responsableEntrega = this.getUser(req);
            obj = {...obj, ...changeset};
            let object = new Recargo(obj);
            const objNuevo = await object.save();
            return res.json(objNuevo);
        } catch (err) {
            return next(err);
        }
    }

    async update(req, res, next){
        const changeset = {
            estado: this.ESTADO_SIN_CONFIRMAR,
            fechaHoraEntrega: timestamp(),
            responsableEntrega: this.getUser(req)
        };
        return await this.saveUpdate(req, res, next, changeset);
    }

    async updateAndConfirmar(req, res, next){
        const changeset = {
            estado: this.ESTADO_CONFIRMADA,
            fechaHoraEntrega: timestamp(),
            responsableEntrega: this.getUser(req)
        };
        return await this.saveUpdate(req, res, next, changeset);
    }

    async updateAndProcesarParcialmente(req, res, next){
        const recargo = req.body;
        let totalmenteProcesado = true;
        for (const item of recargo.planilla) {
            if (!item.procesado){
                totalmenteProcesado = false;
                break;
            }
        }
        
        const changeset = {
            estado: totalmenteProcesado? this.ESTADO_PROCESADA : this.ESTADO_PROCESADA_PARCIALMENTE,
            fechaHoraProcesamiento: timestamp(),
            responsableProcesamiento: this.getUser(req)
        };
        return await this.saveUpdate(req, res, next, changeset);        
    }

    async updateAndProcesar(req, res, next){
        const changeset = {
            estado: this.ESTADO_PROCESADA,
            fechaHoraProcesamiento: timestamp(),
            responsableProcesamiento: this.getUser(req)
        };
        return await this.saveUpdate(req, res, next, changeset);
    }

    async updateAndHabilitarEdicion(req, res, next){
        const changeset = {
            estado: this.ESTADO_SIN_CONFIRMAR,
            fechaHoraProcesamiento: timestamp(),
            responsableProcesamiento: this.getUser(req)
        };
        return await this.saveUpdate(req, res, next, changeset);
    }

    /**
     * Helper utilizado por los metodos 'update', y 'updateAndConfirmar'
     * Basicamente guarda una guardia actualizando los parametros indicados
     * en el changeset
     * @param changeset
     */
    async saveUpdate(req, res, next, changeset){
        try {
            const id = req.params.id;
            if (!id || (id && !Types.ObjectId.isValid(id))) return res.status(404).send();
            let objToUpdate:any = await Recargo.findById(id);
            if (!objToUpdate) return res.status(404).send();
            let objWithChanges = req.body;
            objWithChanges = {...objWithChanges, ...changeset};
            await objToUpdate.updateOne({ $set: objWithChanges });
            const objUpdated = await Recargo.findById(id);
            return res.json(objUpdated);
        } catch (err) {
            return next(err);
        }   
    }


}

export default RecargoController; 