import BaseController from "../../../core/app/basecontroller";
import { Guardia } from "../schemas/guardia";
import { Types } from "mongoose";

import * as moment from 'moment';
import { timestamp } from "../../../core/utils/dates";

const fs = require('fs');
const csv = require('fast-csv');

class GuardiaController extends BaseController {

    constructor(model) {
        super(model);
        this.addAndConfirmar = this.addAndConfirmar.bind(this);
        this.updateAndConfirmar = this.updateAndConfirmar.bind(this);
        this.updateAndProcesar = this.updateAndProcesar.bind(this);
        this.generarCSV = this.generarCSV.bind(this);
    }

    // Posibles estados de la guardia (planilla)
    ESTADO_SIN_CONFIRMAR = 0;
    ESTADO_CONFIRMADA = 1;
    ESTADO_PROCESADA = 2;

    protected getQueryParams(req, casters?) {
        let queryParams = super.getQueryParams(req, casters);
        // Add default order
        queryParams['sort'] = { 'estado': 1, 'periodo.fechaHasta': -1, 'fechaHoraEntrega': -1 }
        return queryParams;
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

    async updateAndProcesar(req, res, next){
        const changeset = {
            estado: this.ESTADO_PROCESADA,
            fechaHoraProcesamiento: timestamp(),
            responsableProcesamiento: this.getUser(req)
        };
        return await this.saveUpdate(req, res, next, changeset);
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
            if (!guardia) return res.status(404).send({message: "Not found"});
            let ws = fs.createWriteStream('/tmp/guardia.csv');
            let filasCSV = this._generarFilasCSV(guardia);
            csv.write(filasCSV, {
                    headers: false,
                    delimiter: ';'
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

    private _generarFilasCSV(guardia){
        let filasCSV = [];
        // Datos del Encabezado.
        const tipoGuardia = (guardia.lote.tipoGuardia == 'pasiva')? "PASIVA":"ACTIVA";
        const esProfesional = (guardia.lote.categoria.nombre == 'Profesional')? "X": "";
        const esTecnico = (guardia.lote.categoria.nombre == 'Técnico')? "X": "";
        const esAuxiliar = (guardia.lote.categoria.nombre == 'Auxiliar')? "X":"";
        const fechaDesde = moment(guardia.periodo.fechaDesde).utc().format('DD MMMM');
        const fechaHasta = moment(guardia.periodo.fechaHasta).utc().format('DD MMMM YYYY');
        let row1 = `CERTIFICACIÓN DE GUARDIA ${tipoGuardia}S,,,,,,,,,,,PROFESIONALES,,,,,${esProfesional},,,,,,,,,,,,,,,,,,,`;
        let row2 = `,,,,,,,,,,,TÉCNICOS,,,,,${esTecnico},,,,,,,,,,,,,,,,,,,`;
        let row3 = `,,,,,,,,,,,AUXILIARES,,,,,${esAuxiliar},,,,,,,,,,,,,,,,,,,`;
        let row4 = `Dependencia:,,Hospital Castro Rendón,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,`;
        let row5 = `Guardias Periodo,,${fechaDesde} al ${fechaHasta},,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,`;
        let row6 = `,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,TOTAL`;
        
        filasCSV.push(row1.split(','));
        filasCSV.push(row2.split(','));
        filasCSV.push(row3.split(','));
        filasCSV.push(row4.split(','));
        filasCSV.push(row5.split(','));
        filasCSV.push(row6.split(','));
        
        // Datos de las Guardias por Agente
        let headers = ["DEM.","SERVICIO","Nº DE LEGAJO","NOMBRE Y APELLIDO","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15"];
        filasCSV.push(headers);
        let totalGuardiasPlanilla = 0
        let range = guardia.periodo.range();
        guardia.planilla.forEach(guardiaAgente => {
            let grillaGuardias = [];
            let totalGuardiasAgente = 0;
            grillaGuardias.push("");
            grillaGuardias.push(guardia.lote.servicio.nombre);
            grillaGuardias.push(guardiaAgente.agente.numero);
            grillaGuardias.push(`${guardiaAgente.agente.nombre} ${guardiaAgente.agente.apellido}`);
            range.forEach((dia, index) => {
                if (guardiaAgente.diasGuardia[index]){
                    const diaCompleto = guardiaAgente.diasGuardia[index].diaCompleto;
                    totalGuardiasAgente += diaCompleto? 1:0.5;
                    grillaGuardias.push(diaCompleto?'X':'M');
                }
                else{
                    grillaGuardias.push('');
                }
            });
            grillaGuardias.push(totalGuardiasAgente);
            filasCSV.push(grillaGuardias);
            totalGuardiasPlanilla += totalGuardiasAgente;
        });
        const lineaVacia = `,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,`.split(',');
        //Total Planilla
        filasCSV.push(`,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,${totalGuardiasPlanilla}`.split(',')); 
        // Observaciones
        filasCSV.push(`Observaciones:,,(X = guardia de 24hs.) - (M = guardia de 12hs),,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,`.split(','));
        filasCSV.push(lineaVacia);
        filasCSV.push(lineaVacia);
        filasCSV.push(lineaVacia);
        filasCSV.push(lineaVacia);
        // Footer
        filasCSV.push(`,,,,,,,,,,,,,,,,,,,,,,,Firma y Sello del Director,,,,,,,,,,,,`.split(','));
        filasCSV.push(lineaVacia);
        filasCSV.push(`,,,,Subsecretaría de Salud,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,`.split(','));
        filasCSV.push(`,,,(Centro Administrativo Ministerial). Antártida Argentina 1245. Edificio 3,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,`.split(','));
        filasCSV.push(`,,,,,0299 - 449 5590 - 5591.  www. Saludneuquen.gov.ar,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,`.split(','));
        return filasCSV;
    }


    /**
     * Helper utilizado por los metodos 'add', y 'addAndConfirmar'
     * Basicamente crea una guardia, aplicandole los valores enviados
     * en el changeset
     * @param changeset
     * TODO: Validar que el periodo, y lote sean unicos 
     */
    async saveAdd(req, res, next, changeset){
        try {
            let obj = req.body;
            obj = this.cleanObjectID(obj)
            obj.fechaHoraEntrega = timestamp();
            obj.responsableEntrega = this.getUser(req);
            obj = {...obj, ...changeset};
            let object = new Guardia(obj);
            const objNuevo = await object.save();
            return res.json(objNuevo);
        } catch (err) {
            return next(err);
        }
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
            let objToUpdate:any = await Guardia.findById(id);
            if (!objToUpdate) return res.status(404).send();
            let objWithChanges = req.body;
            objWithChanges = {...objWithChanges, ...changeset};
            await objToUpdate.updateOne({ $set: objWithChanges });
            const objUpdated = await Guardia.findById(id);
            return res.json(objUpdated);
        } catch (err) {
            return next(err);
        }   
    }

}

export default GuardiaController; 
