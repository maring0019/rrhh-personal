import BaseController from "../../../core/app/basecontroller";
import { Guardia } from "../schemas/guardia";
import { Types } from "mongoose";

const fs = require('fs');
const csv = require('fast-csv');

class GuardiaController extends BaseController {

    constructor(model) {
        super(model);
        this.addAndConfirmar = this.addAndConfirmar.bind(this);
        this.updateAndConfirmar = this.updateAndConfirmar.bind(this);
        this.updateAndValidar = this.updateAndValidar.bind(this);
        this.generarCSV = this.generarCSV.bind(this);
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

    async updateAndValidar(req, res, next){
        return await this.saveUpdate(req, res, next, this.ESTADO_VALIDADA);
    }

    
    /**
     * Genera un archivo en formato csv a partir del id de una 
     * guardia enviado por parametro en la url.
     * TODO Consultar las columnas y formato final para el csv  
     */
    async generarCSV(req, res, next){
        try {
            const id = req.params.id;
            if (!id || (id && !Types.ObjectId.isValid(id))) return res.status(404).send();
            let objToExport:any = await Guardia.findById(id).lean();
            if (!objToExport) return res.status(404).send();
            let ws = fs.createWriteStream('/tmp/guardia.csv', { encoding: 'utf8' });
            
            csv.write(objToExport.planilla, {
                    headers: true, transform: (row) => {
                        return {
                            Agente: row.agente.nombre
                        };
                    }
                })
                .pipe(ws)
                .on('finish', () => {
                    res.download(('/tmp/guardia.csv' as string), (err) => {
                        if (err) {
                            next(err);
                        } else {
                            next();
                        }
                    });
                });
        } catch (err) {
            return next(err);
        }


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
