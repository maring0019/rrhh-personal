import { Types } from 'mongoose';
import BaseController from '../../../core/app/basecontroller';
import { Parte } from '../schemas/parte';
import { ParteAgente } from '../schemas/parteagente';
import { ParteEstado } from '../schemas/parteestado';
import { Agente } from '../../agentes/schemas/agente';

class ParteController extends BaseController {

    /**
     * Crea un nuevo parte con parametros "fecha" y "ubicacion" provistos en
     * el body. Por defecto ademas el estado del parte sera "Sin Presentar".
     * A su vez se crean los partes de los agentes con referencia al nuevo
     * parte creado.
     * @param req 
     * @param res 
     * @param next 
     */
    async add(req, res, next) {
        try {
            let obj = req.body;
            if (!obj.estado){
                const estadoSinPresentar = await ParteEstado.findOne({ codigo: 0}).lean();
                obj.estado = { id:estadoSinPresentar._id, nombre: estadoSinPresentar.nombre }
            }
            let parte = new Parte(obj);
            const parteNew = await parte.save();
            // Una vez creado el parte 'general' creamos los partes
            // de los agentes que pertenecen a la ubicacion indicada
            let agentes = await Agente.find(
                {
                    'situacionLaboral.cargo.servicio.ubicacion': obj.ubicacion.codigo,
                    'activo': true
                }).lean();
            let partes = [];
            for (const agente of agentes) {
                const parteAgente = new ParteAgente({
                    parte: { id: parteNew._id },
                    agente: { id: agente._id, nombre: agente.nombre, apellido: agente.apellido },
                    fecha: obj.fecha
                });
                partes.push(parteAgente);
            }
            ParteAgente.insertMany(partes);
            return res.json(parteNew);
        } catch (err) {
            return next(err);
        }
    }


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
        // Los parametros de busqueda fechaDesde y fechaHasta son obligatorios
        // Estos parametros vienen en url como fecha> y fecha< respectivamente
        const fechaDesde = queryParams.filter.fecha? queryParams.filter.fecha.$gte: null;
        const fechaHasta = queryParams.filter.fecha? queryParams.filter.fecha.$lte: null;
        delete queryParams.filter['fecha'];
        queryParams.filter.$expr = { $and:
            [   // Busqueda solo por fecha, sin importar la hora o tz
                { $lte: [
                    { $dateToString: { date: "$fecha", format:"%Y-%m-%d"}} ,
                    { $dateToString: { date: fechaHasta, format:"%Y-%m-%d"}}
                    ]
                },
                { $gte: [
                    { $dateToString: { date: "$fecha", format:"%Y-%m-%d"}} ,
                    { $dateToString: { date: fechaDesde, format:"%Y-%m-%d"}}
                ]}
            ]}
        return queryParams;
    } 
}

export default ParteController; 
