import BaseController from '../../../core/app/basecontroller';

import { IndicadorAusentismo } from '../schemas/indicador';

class IndicadorController extends BaseController {
    
    constructor(model) {
        super(model);
        this.getIndicadorLicencia = this.getIndicadorLicencia.bind(this);
        this.addIndicadorLicencia = this.addIndicadorLicencia.bind(this);
        
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

    async getIndicadorLicencia(req, res, next){
        try {
            let objs = []
            const casters = this.getQueryParamsCasters();
            const params = this.getQueryParams(req, casters);
            let filters = params.filter;
            if (JSON.stringify(filters) !== JSON.stringify({})){
                let pipeline:any = [
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
                    },
                    { $match: filters },
                    { $sort: { 'agente.apellido': 1, 'vigencia': -1 }}
                ]
                objs = await IndicadorAusentismo.aggregate(pipeline);
            }
            return res.json(objs);
        } catch (err) {
            return next(err);
        }
    }
    
    async addIndicadorLicencia(req, res, next){
    }
}

export default IndicadorController;