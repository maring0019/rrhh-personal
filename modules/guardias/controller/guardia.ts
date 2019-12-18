import BaseController from "../../../core/app/basecontroller";
import { Guardia } from "../schemas/guardia";
import { Types } from "mongoose";

import * as moment from 'moment';

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
     */
    async generarCSV(req, res, next){
        try {
            const id = req.params.id;
            if (!id || (id && !Types.ObjectId.isValid(id))) return res.status(404).send();
            let guardia:any = await Guardia.findById(id);
            if (!guardia) return res.status(404).send();
            let ws = fs.createWriteStream('/tmp/guardia.csv');

            // Encabezado
            const tipoGuardia = (guardia.tipoGuardia == 'pasiva')? "PASIVA":"ACTIVA";
            const esProfesional = (guardia.categoria.nombre == 'Profesional')? "x":"TECNICO";
            const esTecnico = (guardia.categoria.nombre == 'Técnico')? "x": (guardia.categoria.nombre == 'Auxiliar')? "AUXILIARES":"TECNICO";
            const esAuxiliar = (guardia.categoria.nombre == 'Auxiliar')? "x":"AUXILIARES";
            const fechaDesde = moment(guardia.periodo.fechaDesde).format('DD/MM/YYYY');
            const fechaHasta = moment(guardia.periodo.fechaHasta).format('DD/MM/YYYY');
            let row1 = `CERTIFICACION DE GUARDIAS ${tipoGuardia}S,,,,PROFESIONAL,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,`;
            let row2 = `Mes:,,,,${esProfesional},,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,`;
            let row3 = `Dependencia: HOSPITAL DR. EDUARDO CASTRO RENDON,,,,${esTecnico},,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,`;
            let row4 = `Guardias ${tipoGuardia.toLowerCase()}s: ${fechaDesde} al ${fechaHasta},,,,${esAuxiliar},,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,`;
            let row5 = `,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,`;
            let filasCSV = [];
            filasCSV.push(row1.split(','));
            filasCSV.push(row2.split(','));
            filasCSV.push(row3.split(','));
            filasCSV.push(row4.split(','));
            filasCSV.push(row5.split(','));
            
            // Guardias por Agente
            let headers = ["DEM","Servicio","Legajo","Agente","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","Total"];
            filasCSV.push(headers);
            let range = guardia.periodo.range();
            guardia.planilla.forEach(guardiaAgente => {
                let grillaGuardias = [];
                let totalGuardias = 0;
                grillaGuardias.push('Nro de Lote'); // TODO Guardar Lote (Crear Schema)
                grillaGuardias.push(guardia.servicio.nombre);
                grillaGuardias.push(guardiaAgente.agente.id); // TODO Guardar Legajo
                grillaGuardias.push(guardiaAgente.agente.apellido);
                range.forEach((dia, index) => {
                    if (guardiaAgente.diasGuardia[index]){
                        const diaCompleto = guardiaAgente.diasGuardia[index].diaCompleto;
                        totalGuardias += diaCompleto? 1:0.5;
                        grillaGuardias.push(diaCompleto?'X':'M');
                    }
                    else{
                        grillaGuardias.push('');
                    }
                });
                grillaGuardias.push(totalGuardias);
                filasCSV.push(grillaGuardias)
            });

            let footer = `Firma y Sello del Director,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,`;
            filasCSV.push(footer.split(','));
            csv.write(filasCSV, {
                    headers: false
                    // transform: (row) => {
                    //     return {
                    //         Agente: row.agente.nombre
                    //     };
                    // }
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
