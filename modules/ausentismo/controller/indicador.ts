import BaseController from '../../../core/app/basecontroller';

import { IndicadorAusentismo } from '../schemas/indicador';
import { Types } from 'mongoose';
import { Articulo } from '../schemas/articulo';


class IndicadorController extends BaseController {
    
    constructor(model) {
        super(model);
        this.getIndicadorLicencia = this.getIndicadorLicencia.bind(this);
        this.getIndicadorLicenciaById = this.getIndicadorLicenciaById.bind(this);
        this.addIndicadorLicencia = this.addIndicadorLicencia.bind(this);
        this.updateIndicadorLicencia = this.updateIndicadorLicencia.bind(this);
        this.deleteIndicadorLicencia = this.deleteIndicadorLicencia.bind(this);
        
    }

    async add(req, res, next) {
        try {
            const obj = new IndicadorAusentismo({
                agente: req.body.agente,
                articulo: req.body.articulo,
                vigencia: req.body.vigencia,
                periodo: req.body.periodo,
                vencido: req.body.vencido,
                intervalos: req.body.intervalos
            });
            const objNuevo = await obj.save();
            return res.json(objNuevo);
        } catch (err) {
            return next(err);
        }
    }
    
    // Pipeline reutilizable en las busquedas. Realiza un 'join'
    // sobre la coleccion de agentes y ajusta los datos proyectados
    joinAgentePipeline:any = [
        { $lookup: {
            from: 'agentes',
                localField: 'agente._id',
                foreignField: '_id',
                as: 'agentes'}
        },
        { $unwind: '$intervalos'},
        { $unwind: '$agentes'},
        { $project: { 
            'agente': {
                '_id': '$agentes._id',
                'nombre': '$agentes.nombre',
                'apellido': '$agentes.apellido',
                'numero': '$agentes.numero'
                },
            'vigencia':1,
            'totales': '$intervalos.totales',
            'ejecutadas': '$intervalos.ejecutadas' }
        }
    ]

    async getIndicadorLicenciaById(req, res, next){
        try {
            const id = req.params.id;
            if (!id || (id && !Types.ObjectId.isValid(id))) return res.status(404).send({ message:"Not found"});

            let pipeline:any = [{ $match: { '_id': Types.ObjectId(id) }}].concat(this.joinAgentePipeline);
            
            let objs = await IndicadorAusentismo.aggregate(pipeline);
            if (objs.length == 1){
                return res.json(objs[0]);
            }
            else {
                return res.status(404).send({ message:"Not found"});
            }
        } catch (err) {
            console.log(err);
            return next(err);
        }
    }

    async getIndicadorLicencia(req, res, next){
        try {
            let objs = []
            const casters = this.getQueryParamsCasters();
            const params = this.getQueryParams(req, casters);
            let filters = params.filter;
            if (JSON.stringify(filters) !== JSON.stringify({})){
                let pipeline:any = this.joinAgentePipeline.concat(
                    [{ $match: filters },{ $sort: { 'agente.apellido': 1, 'vigencia': -1 }}])
                objs = await IndicadorAusentismo.aggregate(pipeline);
            }
            return res.json(objs);
        } catch (err) {
            return next(err);
        }
    }
    
    async addIndicadorLicencia(req, res, next){
        try {
            const agente = req.body.agente;
            const artLicencia = await Articulo.findOne({codigo:"53"});
            let indicadorSimilar =  await IndicadorAusentismo.find(
                { "agente._id": agente._id, "articulo._id": artLicencia._id, "vigencia": req.body.vigencia });
            
            if (indicadorSimilar.length > 0 ) return res.status(400).send({ message:"Ya existe otro registro con el mismo periodo."});
            
            const obj = new IndicadorAusentismo({
                agente: agente,
                articulo: artLicencia,
                vigencia: req.body.vigencia,
                periodo: req.body.periodo,
                vencido: req.body.vencido,
                intervalos: [ { totales:req.body.totales, ejecutadas: req.body.ejecutadas }] 
            });
            const objNuevo = await obj.save();
            return res.json(objNuevo);
        } catch (err) {
            return next(err);
        }
    }

    async updateIndicadorLicencia(req, res, next){
        try {
            const id = req.params.id;
            if (!id || (id && !Types.ObjectId.isValid(id))) return res.status(404).send({ message:"Not found"});
            
            let objToUpdate:any = await IndicadorAusentismo.findById(id);
            if (!objToUpdate) return res.status(404).send({ message:"Not found"});

            if (req.body.vigencia != objToUpdate.vigencia){
                const indicadorSimilar =  await IndicadorAusentismo.find(
                    { "agente._id": objToUpdate.agente._id, "articulo._id": objToUpdate.articulo._id, "vigencia": req.body.vigencia });

                if (indicadorSimilar.length > 0 ) return res.status(400).send({ message:"Ya existe otro registro con el mismo periodo."});
            }            

            let obj = objToUpdate.toObject(); // To allow ... operator
            
            let objWithChanges = {
                vigencia: req.body.vigencia,
                intervalos: [{
                    ...obj.intervalos[0],// Keep some values and ovewrite updated fields
                    ...{ totales:req.body.totales, ejecutadas:req.body.ejecutadas}}]
            };

            await objToUpdate.updateOne({ $set: objWithChanges });
            return res.json(objToUpdate);
        } catch (err) {
            return next(err);
        }
    }

    async deleteIndicadorLicencia(req, res, next){
        return super.delete(req, res, next);
    }
}

export default IndicadorController;