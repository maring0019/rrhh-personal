import { Types } from 'mongoose';
import BaseController from '../../../core/app/basecontroller';
import { Parte } from '../schemas/parte';
import { ParteAgente } from '../schemas/parteagente';
import { ParteEstado } from '../schemas/parteestado';
import { Agente } from '../../agentes/schemas/agente';
import { FichadaCache } from '../schemas/fichadacache';
import { isDateEqual, isDateBefore, addOneDay, dateOnly } from '../../../core/utils/dates';

class ParteController extends BaseController {
    
    constructor(model) {
        super(model);
        this.guardar = this.guardar.bind(this);
        this.confirmar = this.confirmar.bind(this);
        this.editar = this.editar.bind(this);
        this.getPartesAgentes = this.getPartesAgentes.bind(this);
        this.getPartesAgenteReporte = this.getPartesAgenteReporte.bind(this);
        this.getFichadasAgentesReporte = this.getFichadasAgentesReporte.bind(this);
        this.cleanQueryParams = this.cleanQueryParams.bind(this);
        this.queryPartesAgente = this.queryPartesAgente.bind(this);
     }
 
    // Posibles estados del parte diario
    ESTADO_SIN_PRESENTAR = 0;
    ESTADO_PRESENTACION_PARCIAL = 1;
    ESTADO_PRESENTACION_TOTAL = 2;

    async findEstadoParte(estadoFilter){
        return await ParteEstado.findOne({ codigo: estadoFilter}).lean();
    }


    async get(req, res, next) {
        try {
            const casters = this.getQueryParamsCasters();
            const queryParams = this.getQueryParams(req, casters);
            let params = this.cleanQueryParams(queryParams);
            let objs = await this.search(params);
            return res.json(objs);
        } catch (err) {
            return next(err);
        }
    }

    /**
     * Crea un nuevo parte con parametros "fecha" y "ubicacion" provistos en
     * el body. Por defecto ademas el estado del parte sera "Sin Presentar".
     * A su vez se crean los partes de los agentes con referencia al nuevo
     * parte creado. 
     */
    async add(req, res, next) {
        try {
            let obj = req.body;
            if (!obj.estado){
                const estadoSinPresentar:any = await this.findEstadoParte(this.ESTADO_SIN_PRESENTAR);
                obj.estado = { _id:estadoSinPresentar._id, nombre: estadoSinPresentar.nombre }
            }
            let parte = new Parte(obj);
            const parteNew = await parte.save();
            // Una vez creado el parte 'general' creamos los partes
            // de los agentes que pertenecen a la ubicacion indicada
            let agentes:any = await Agente.find(
                {
                    'situacionLaboral.cargo.servicio.ubicacion': obj.ubicacion.codigo,
                    'activo': true
                }).lean();
            let partes = [];
            for (const agente of agentes) {
                const parteAgente = new ParteAgente({
                    parte: { _id: parteNew._id },
                    agente: { _id: agente._id, nombre: agente.nombre, apellido: agente.apellido },
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
     * Recupera informacion de los partes de los agentes para un parte diario en
     * particular cuyo id es especificado por parametro. Si el id es invalido
     * retornamos el status 404.
     * Los partes de los agentes se deben retornar con informacion de las fichadas
     * del dia y eventualmente informacion de los articulos que se hayan ingresado
     * en caso de una ausencia. Para obtener toda esta informacion basicamente  se
     * realiza un 'join' con las colecciones partes, fichadascache, ausenciasperiodo
     */
    async getPartesAgentes(req, res, next){
        try {
            const id = req.params.id;
            if (!id || (id && !Types.ObjectId.isValid(id))) return next(404);
            let parte:any = await Parte.findById(id);
            if (!parte) return next(404);
            let pipeline:any = [
                { $match: { 'parte._id': Types.ObjectId(parte._id) } }
            ]
            pipeline = pipeline
                .concat(this.pipelineLookupFichadas)
                .concat(this.pipelineLookupAusentismo)
                .concat([{ $sort: { 'agente.apellido': 1 }}]);
            let partes = await ParteAgente.aggregate(pipeline);
            return res.json(partes);
        } catch (err) {
            return next(err);
        }
    }

    /**
     * Recupera informacion de los partes de un agente en particular
     * en un rango de fechas.
     */
    async getPartesAgenteReporte(req, res, next){
        try {
            let objs = await this.queryPartesAgente(req);
            return res.json(objs);
        } catch (err) {
            return next(err);
        }
    }

    
    /**
     * Query final para recuperar informacion de los partes de un agente
     * en particular en un rango de fechas.  Para recuperar los datos de
     * las fichadas y ausencias, utiliza los mismos pipelines que el metodo
     * 'getPartesAgentes'.
     * Esta consulta se utiliza tambien para la generacion del reporte pdf.
     */
    async queryPartesAgente(req){
        let casters = 
            {
                casters: {
                    documentoId: val => Types.ObjectId(val),
                },
                castParams: {
                    'agente._id': 'documentoId' // castea el param agente.id al tipo ObjectId
                }
            }
        const qp = this.getQueryParams(req, casters);
        // Se utilizan posteriormente
        if (!qp.filter.fecha || !qp.filter.fecha.$gte || !qp.filter.fecha.$lte){
            return [];
        }
        let fechaDesde = new Date(qp.filter.fecha.$gte);
        let fechaHasta = new Date(qp.filter.fecha.$lte);
        const params = this.cleanQueryParams(qp);
        
        // Search Pipeline
        let pipeline:any = [
            { $match: params.filter || {}} ,
            { $sort: params.sort || { fecha: 1 }},
            { $lookup: {
                from: "partes",
                let: { parte_id: "$parte._id"},
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

        pipeline = pipeline
            .concat(this.pipelineLookupFichadas)
            .concat(this.pipelineLookupAusentismo);
        let partes = await ParteAgente.aggregate(pipeline);
        // Renellamos con partes 'vacios' para aquellos dias del rango consultado
        // que no se encontraron partes (Por ej sab y dom).
        let partesFull = [];
        let index = 0;
        while (fechaDesde <= fechaHasta){
            if (index < partes.length){
                const parte = partes[index];
                if (isDateEqual(parte.fecha, fechaDesde)){
                    partesFull.push(parte);
                    index +=1;
                    fechaDesde = addOneDay(fechaDesde);
                } else if (isDateBefore(parte.fecha, fechaDesde)) {
                    partesFull.push(parte);
                    index +=1;
                }
                else{
                    partesFull.push(new ParteAgente({fecha:fechaDesde}));
                    fechaDesde = addOneDay(fechaDesde);
                }
            }
            else{
                partesFull.push(new ParteAgente({fecha:fechaDesde}));
                fechaDesde = addOneDay(fechaDesde);
            }
        }
        return partesFull;
    }

    /**
     * Recupera informacion de las fichadas de uno o mas agentes  en un rango de fechas
     * y lugar de trabajo (alias ubicaciones).
     */
    async getFichadasAgentesReporte(req, res, next){
        try {
            let objs = [];
            let casters = 
                {
                    casters: {
                        documentoId: val => Types.ObjectId(val),
                    },
                    castParams: { // castea los param agente.id  y ubicacion.id al tipo ObjectId
                        'agente._id': 'documentoId', 
                        'ubicacion._id': 'documentoId'
                    }
                }
            const qp = this.getQueryParams(req, casters);
            let ubicacion;
            // Si se aplica un filtro por ubicacion, por el momento solo es requerido
            // al realizar el lookup con agentes, por lo tanto lo quitamos del conjunto
            // de filtros para la busqueda de fichadas. 
            // Analizar si no es conveniente en un futuro colocar la información de la
            // ubicacion del agente como parte de los datos de la fichada ya que si el 
            // agente cambia de ubicacion/lugar de trabajo, no queda registro de la real
            // ubicacion al momento de fichar. Sí seria posible obtener esta info desde 
            // el parte (ya que el parte si tiene ubicacion), sin embargo no siempre se
            // emiten los partes para todos los agentes.
            if (qp.filter.ubicacion) {
                ubicacion = qp.filter.ubicacion;
                delete qp.filter['ubicacion']
            }
            // Filtros por fecha.
            let fechaDesde:Date;
            let fechaHasta:Date;
            if ( qp.filter && qp.filter.fecha){
                const paramFecha = qp.filter.fecha;
                if (paramFecha instanceof Date){
                    fechaDesde = dateOnly(paramFecha);
                    fechaHasta = dateOnly(paramFecha);
                }
                else{
                    fechaDesde = dateOnly(paramFecha.$gte) || null;
                    fechaHasta = dateOnly(paramFecha.$lte) || null;
                }
                delete qp.filter['fecha'];
            }
            if (fechaDesde == null || fechaHasta == null)
                return res.status(400).send({message:"Fecha desde y Fecha hasta son obligatorios"});
            qp.filter.fecha = {
                $gte: fechaDesde,
                $lte: fechaHasta
            }
            // Identificamos primero los agentes que se utilizaran como filtro en
            // el pipeline. Los agentes se pueden filtrar por id o por ubicacion.
            let agentesID;
            let agenteID = qp.filter['agente._id']? Types.ObjectId(qp.filter['agente._id']):null;

            if (ubicacion){
                agentesID = await Agente.find({"situacionLaboral.cargo.servicio.ubicacion" : ubicacion}).distinct('_id')
            }
           
            // Si el agente buscado no pertenece al servicio filtrado evitamos seguir 
            // con la consulta general y simplemente retornamos un array vacio.
            if (agentesID && agenteID && agentesID.findIndex((e) => e.equals( agenteID))==-1) return res.json([]);
            
            // Aqui determinamos si buscamos las fichadas de un agente particular o las
            // las fichadas de todos los agentes de un servicio/ubicacion
            if (agentesID && !qp.filter['agente._id']) qp.filter['agente._id'] = {"$in":  agentesID };

            // Search Pipeline
            let pipeline:any = [
                { $match: qp.filter || {}} ,
                { $sort: qp.sort || { fecha: 1 }},
                { $lookup: {
                    from: "agentes",
                    localField: "agente._id",
                    foreignField: "_id",

                    as: "agente"
                    }
                },
                { $unwind: { path: "$agente" } },
                { $project: 
                    {
                        agente: { nombre: '$agente.nombre', apellido: '$agente.apellido' } ,
                        ubicacion: '$agente.situacionLaboral.cargo.servicio',
                        fecha: 1,
                        entrada: 1,
                        salida: 1,
                        horasTrabajadas:  { "$subtract": [ "$salida", "$entrada" ] } // dif en milisegundos
                    }
                } 
            ]
            
            objs = await FichadaCache.aggregate(pipeline);
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
            if (!objToUpdate) return res.status(404).send({message:"Not found"});
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
            if (!req.user || !req.user.usuario) return res.status(403).send();

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
            const nuevoEstado:any = await this.findEstadoParte(estadoParte);
            // 3. Actualizamos el flag de novedades del parte. Si algun
            // parte de agente tiene inconsistencias o no.
            let novedades = false;
            let results:any = await ParteAgente.find({ 'parte._id': objToUpdate._id});
            for (const parteAgente of results) {
                novedades = parteAgente.hasNovedades();
                if (novedades)break;
            }
            // 4. Actualizamos el flag para indicar si fue editado luego
            // de haber sido confirmado
            let editadoPostProcesado = objToUpdate.editadoPostProcesado;
            if (objToUpdate.procesado) editadoPostProcesado = true;
            // 5. Recuperamos el usuario del request y se lo adjuntamos
            // al parte que estamos guardando
            const usuario = req.user.usuario;
            // Aplicamos todos los cambios sobre el parte
            let objUpdated = await objToUpdate.updateOne(
                { $set: 
                    { 
                        estado : { _id: nuevoEstado._id, nombre: nuevoEstado.nombre } },
                        fechaEnvio: new Date(),
                        novedades: novedades,
                        procesado: false, // Siempre se vuelve al estado de no procesado
                        editadoPostProcesado: editadoPostProcesado,
                        usuarioEnvio: {
                            _id: usuario.id,
                            nombre: usuario.nombre, 
                            apellido: usuario.apellido
                        },
                    });
            objUpdated = await this.getObject(req.params.id);
            return res.json(objUpdated);
        } catch (err) {
            return next(err);
        }   
    }

    cleanQueryParams(params){
        let queryParams = {...params}
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
        // queryParams.filter = { fecha: {
        //         $gte: fechaDesde,
        //         $lte: fechaHasta
        //     }
        // }
        
        return queryParams;
    }


    pipelineLookupAusentismo =  [
        // Join con ausenciasperiodo sobre agente y fecha
        { $lookup: {
            from: "ausenciasperiodo",
            let: { agente_parte: "$agente._id", fecha_parte: "$fecha"},
            pipeline: [
                { $match:
                    { $expr:
                        { $and:
                            [
                                { $eq: [ "$agente._id",  "$$agente_parte" ] },
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
            let: { agente_parte: "$agente._id", fecha_parte: "$fecha"},
            pipeline: [
                { $match:
                    { $expr:
                        { $and:
                            [
                                { $eq: [ "$agente._id",  "$$agente_parte" ] }, 
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
