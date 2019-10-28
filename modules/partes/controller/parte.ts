import { Types } from 'mongoose';
import BaseController from '../../../core/app/basecontroller';
import { Parte } from '../schemas/parte';
import { ParteAgente } from '../schemas/parteagente';

class ParteController extends BaseController {


    async getPartesAgentes(req, res, next){
        try {
            const id = req.params.id;
            if (!id || (id && !Types.ObjectId.isValid(id))) return next(404);
            let parte:any = await Parte.findById(id);
            if (!parte) return next(404);
            const pipeline = [
                { $match: { 'parte.id': Types.ObjectId(parte._id) } },
                // Join con fichadascache sobre agente y fecha
                { $lookup: {
                    from: "fichadascache",
                    let: { agente_parte: "$agente.id", fecha_parte: "$fecha"},
                    pipeline: [
                        { $match:
                            { $expr:
                                { $and:
                                    [
                                        { $eq: [ "$agente.id",  "$$agente_parte" ] }, 
                                        { $eq: [
                                             // Busqueda solo por fecha, sin importar la hora o tz
                                             { $dateToString: { date: "$fecha", format:"%Y-%m-%d"}} ,
                                             { $dateToString: { date: "$$fecha_parte", format:"%Y-%m-%d"}}
                                            ] }
                                    ]
                                }
                            }
                        },
                        { $project: 
                            {
                                entrada: 1,
                                salida: 1,
                                horasTrabajadas:  { "$subtract": [ "$salida", "$entrada" ] } // dif en milisegundos
                            }
                        } 
                    ],
                    as: "fichadas"
                    }
                },
                { $unwind: { path: "$fichadas", preserveNullAndEmptyArrays: true }},
                // Join con ausenciasperiodo sobre agente y fecha
                { $lookup: {
                    from: "ausenciasperiodo",
                    let: { agente_parte: "$agente.id", fecha_parte: "$fecha"},
                    pipeline: [
                        { $match:
                            { $expr:
                                { $and:
                                    [
                                        { $eq: [ "$agente.id",  "$$agente_parte" ] },
                                        // Busqueda solo por fecha, sin importar la hora o tz
                                        { $lte: [
                                            { $dateToString: { date: "$fechaDesde", format:"%Y-%m-%d"}} ,
                                            { $dateToString: { date: "$$fecha_parte", format:"%Y-%m-%d"}}
                                            ]
                                        },
                                        { $gte: [
                                            { $dateToString: { date: "$fechaHasta", format:"%Y-%m-%d"}} ,
                                            { $dateToString: { date: "$$fecha_parte", format:"%Y-%m-%d"}}
                                        ]}
                                    ]
                                }
                            }
                        },
                        { $project: { articulo: 1 } } // Solo interesa el articulo en caso de ausencia
                    ],
                    as: "ausencia"
                    }
                },
                { $unwind: { path: "$ausencia", preserveNullAndEmptyArrays: true} }
            ]
            let partes = await ParteAgente.aggregate(pipeline);
            return res.json(partes);
        } catch (err) {
            return next(err);
        }
    }

    getQueryParams(req){
        let queryParams = super.getQueryParams(req);
        if (queryParams.filter && queryParams.filter.fecha){
            // Ajustamos el filtro fecha para considerar solo 
            // el dia, descartando horas y minutos
            const fecha = queryParams.filter.fecha;
            let fechaSinHora = this.parseOnlyDate(fecha)
            let tomorrow = this.parseOnlyDate(this.addOneDay(fecha)); 
            delete queryParams.filter['fecha'];
            queryParams.filter.$and = [
                {"fecha": {$gte: fechaSinHora}},
                {"fecha": {$lt: tomorrow}}
                ];
        }
        return queryParams;
    }

    addOneDay(fecha){
        let tomorrow = new Date(fecha);
        return new Date(tomorrow.setDate(tomorrow.getDate() + 1));
    }

    parseOnlyDate(date){
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
}

export default ParteController; 
