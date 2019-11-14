import { Types } from 'mongoose';
import BaseController from '../../../core/app/basecontroller';
import { Parte } from '../schemas/parte';
import { ParteAgente } from '../schemas/parteagente';
import { ParteEstado } from '../schemas/parteestado';
import { Agente } from '../../agentes/schemas/agente';

class ParteController extends BaseController {
    
    constructor(model) {
        super(model);
        this.guardar = this.guardar.bind(this);
        this.confirmar = this.confirmar.bind(this);
        this.editar = this.editar.bind(this);
        this.getPartesAgentes = this.getPartesAgentes.bind(this);
        this.getPartesAgenteReporte = this.getPartesAgenteReporte.bind(this);
     }
 
    // Posibles estados del parte diario
    ESTADO_SIN_PRESENTAR = 0;
    ESTADO_PRESENTACION_PARCIAL = 1;
    ESTADO_PRESENTACION_TOTAL = 2;

    async findEstadoParte(estadoFilter){
        return await ParteEstado.findOne({ codigo: estadoFilter}).lean();
    }

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
                const estadoSinPresentar = await this.findEstadoParte(this.ESTADO_SIN_PRESENTAR);
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


    /**
     * Recupera informacion de los partes de los agentes para un parte diario en particular
     * cuyo id es especificado por parametro. Si el id es invalido retornamos el status 404.
     * Los partes de los agentes se deben retornar con informacion de las fichadas del dia y
     * eventualmente informacion de los articulos que se hayan ingresado en caso de una ausencia.
     * Para obtener toda esta informacion basicamente se realiza un 'join' con las colecciones
     * partes, fichadascache, ausenciasperiodo
     */
    async getPartesAgentes(req, res, next){
        try {
            const id = req.params.id;
            if (!id || (id && !Types.ObjectId.isValid(id))) return next(404);
            let parte:any = await Parte.findById(id);
            if (!parte) return next(404);
            let pipeline:any = [
                { $match: { 'parte.id': Types.ObjectId(parte._id) } }
            ]
            pipeline = pipeline.concat(this.pipelineLookupFichadas).concat(this.pipelineLookupAusentismo);
            let partes = await ParteAgente.aggregate(pipeline);
            return res.json(partes);
        } catch (err) {
            return next(err);
        }
    }

    /**
     * Recupera informacion de los partes de un agente en particular en un rango de fechas.
     * Para recuperar los datos de las fichadas y ausencias, utiliza los mismos pipelines
     * que el metodo 'getPartesAgentes'
     */
    async getPartesAgenteReporte(req, res, next){
        try {
            let casters = 
                {
                    casters: {
                        documentoId: val => Types.ObjectId(val),
                    },
                    castParams: {
                        'agente.id': 'documentoId' // castea el param agente.id al tipo ObjectId
                    }
                }
            const params = this.getQueryParams(req, casters);
            // Search Pipeline
            let pipeline:any = [
                { $match: params.filter || {}} ,
                { $sort: params.sort || { fecha: -1 }},
                { $lookup: {
                    from: "partes",
                    let: { parte_id: "$parte.id"},
                    pipeline: 
                        [{ 
                            $match: { 
                                $expr: { 
                                    $eq: ["$$parte_id", "$_id"] // Join con parte id
                                },
                            }
                        }],
                    as: "parte"
                    }
                },
                { $unwind: { path: "$parte", preserveNullAndEmptyArrays: true} }
            ]

            pipeline = pipeline.concat(this.pipelineLookupFichadas).concat(this.pipelineLookupAusentismo);
            let objs = await ParteAgente.aggregate(pipeline);
            return res.json(objs);
        } catch (err) {
            return next(err);
        }
    }

    async procesar(req, res, next){
        try {
            const id = req.params.id;
            if (!id || (id && !Types.ObjectId.isValid(id))) return res.status(404).send();
            let objToUpdate:any = await Parte.findById(id);
            if (!objToUpdate) return res.status(404).send();
            const objUpdated = await objToUpdate.updateOne({ $set: { procesado:true } });
            return res.json(objUpdated);
        } catch (err) {
            return next(err);
        }   
    }

    /**
     * Guarda todos los partes de agentes enviados en el body
     * y actualiza el estado del parte al que pertenecen al de 
     * Presentacion Parcial.
     */
    async guardar(req, res, next){
        return await this.save(req, res, next, this.ESTADO_PRESENTACION_PARCIAL);
    }

    /**
     * Guarda todos los partes de agentes enviados en el body
     * y actualiza el estado del parte al que pertenecen al de 
     * Presentacion Total.
     */
    async confirmar(req, res, next){
        return await this.save(req, res, next, this.ESTADO_PRESENTACION_TOTAL);
    }

    
    /**
     * Al igual que el metodo 'procesar', guarda todos los partes
     * de agentes enviados en el body y actualiza el estado del
     * parte al que pertenecen al de Presentacion Total, pero en 
     * forma complementaria notifica via mail? a un conjunto de
     * usuarios responsables de auditar/validar los cambios que 
     * se han realizado.
     */
    async editar(req, res, next){
        // TODO Notificar a los responsables que corresponda (via mail?)
        return await this.save(req, res, next, this.ESTADO_PRESENTACION_TOTAL);
    }

    /**
     * Helper utilizado por los metodos 'guardar', 'confirmar' y 'editar'.
     * Basicamente guarda un parte dario actualizando su estado segun lo
     * indicado por el parametro estadoParte y los partes de los agentes
     * correspondientes.
     * @param estadoParte 
     */
    async save(req, res, next, estadoParte){
        try {
            const id = req.params.id;
            if (!id || (id && !Types.ObjectId.isValid(id))) return res.status(404).send();
            let objToUpdate:any = await Parte.findById(id);
            if (!objToUpdate) return res.status(404).send();
            // 1. Guardamos primeramente los partes de agentes
            let partesAgentes = req.body;
            await ParteAgente.bulkWrite(
                partesAgentes.map((data) => 
                      ({ updateOne: {
                            filter: { _id: Types.ObjectId(data._id)},
                            update: { $set: data }
                        }
                    })
                )
            )
            // 2. Actualizamos el estado del parte al que pertenecen
            const nuevoEstado = await this.findEstadoParte(estadoParte);
            const objUpdated = await objToUpdate.updateOne(
                { $set: { estado : { id: nuevoEstado._id, nombre: nuevoEstado.nombre } } });
            return res.json(objUpdated);
        } catch (err) {
            return next(err);
        }   
    }

    getQueryParams(req, casters?){
        let queryParams = super.getQueryParams(req, casters);
        // El parametro fecha puede venir de dos formas diferentes en la url:
        //  - como una fecha en particular fecha=valor
        //  - como un rango de fechas fecha>=valor&fecha<=valor
        // Los parametros de busqueda de partes por fecha por lo tanto se deben
        // ajustar segun sea el caso.
        let fechaDesde:Date;
        let fechaHasta:Date;
        if ( queryParams.filter && queryParams.filter.fecha){
            const paramFecha = queryParams.filter.fecha;
            if (paramFecha instanceof Date){
                fechaDesde = paramFecha;
                fechaHasta = paramFecha;
            }
            else{
                fechaDesde = paramFecha.$gte || null;
                fechaHasta = paramFecha.$lte || null;
            }
            delete queryParams.filter['fecha'];
        }

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


    pipelineLookupAusentismo =  [
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

    pipelineLookupFichadas = [
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
        { $unwind: { path: "$fichadas", preserveNullAndEmptyArrays: true }}
    ]
}

export default ParteController; 
