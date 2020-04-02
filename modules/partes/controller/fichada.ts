import { Types } from 'mongoose';

import BaseController from '../../../core/app/basecontroller';
import { Fichada } from '../schemas/fichada';
import { FichadaCache } from '../schemas/fichadacache';
import { Agente } from '../../agentes/schemas/agente';



class FichadaController extends BaseController {

    constructor(model) {
        super(model);
        this.addFromFichador = this.addFromFichador.bind(this);
        this.actualizaFichadaIO = this.actualizaFichadaIO.bind(this);
    }

    /**
     * Guarda una nueva fichada proveniente del fichador. El nro de
     * agente se provee en el body (el fichador por ahora desconoce
     * los id internos utilizados en mongodb). Por lo tanto se debe
     * identificar primero correctamente el agente que ha fichado.
     * Luego se actualiza la fichada cache para intentar 'emparejar'
     * una fichada de entrada con una de salida para asi determinar
     * luego la cantidad de hs trabajadas.
     * Obs: Este metodo es un reemplazo 'temporal' al trigger que se
     * ejecuta actualmente en el viejo sistema luego de cada insert
     * en la tabla de fichadas.
     */
    async addFromFichador(req, res, next) {
        try {
            let obj = req.body;
            // Primero necesitamos recuperar el agente en mongodb a partir 
            // del numero de agente del viejo sistema
            if (! obj.agente) return res.status(404).send();
            const agente = await Agente.findOne({ numero: obj.agente }, { _id: 1, nombre: 1, apellido: 1}).lean();
            if (!agente) return res.status(404).send();
            // El agente existe. Creamos la fichada con sus respectivos 
            // datos y guardamos en la base.
            let object = new Fichada(
                {
                    agente: {
                        _id: agente._id,
                        nombre: agente.nombre,
                        apellido: agente.apellido
                    },
                    fecha: obj.fecha,
                    esEntrada: obj.esEntrada,
                    reloj: obj.reloj
                });
            const nuevaFichada = await object.save();
            // Finalmente actualizamos la fichadacache (entrada y salida)
            await this.actualizaFichadaIO(nuevaFichada);
            return res.json(nuevaFichada);
        } catch (err) {
            return next(err);
        }
    }

    async actualizaFichadaIO(nuevaFichada) {
        let fichadaIO; 
        if (nuevaFichada.esEntrada){
            fichadaIO = new FichadaCache({  
                agente: nuevaFichada.agente,
                fecha: this.parseDate(nuevaFichada.fecha),
                entrada: nuevaFichada.fecha,
                salida: null
            })       
        }
        else{
            let correspondeNuevaFichadaIO = true;
            // Busco fichadas cache del dia y el dia anterior
            fichadaIO = await this.findFichadaEntradaPrevia(nuevaFichada.agente._id, nuevaFichada.fecha);
            if (fichadaIO){
                if (this.diffHours(nuevaFichada.fecha, fichadaIO.fecha) <= 24) {
                    // Si pasaron menos de 24hs respecto a la fichada de entrada
                    // actualizamos con la salida indicada.
                    fichadaIO.salida = nuevaFichada.fecha;
                    correspondeNuevaFichadaIO = false;
                }
                
            }
            if (correspondeNuevaFichadaIO){
                fichadaIO = new FichadaCache({  
                    agente: nuevaFichada.agente,
                    fecha: this.parseDate(nuevaFichada.fecha),
                    entrada: null,
                    salida: nuevaFichada.fecha
                })  
            }
        }
        await fichadaIO.save();
    }


    /**
     * Dado el ID de un agente y una fichada de salida, intentamos recuperar
     * la mejor fichada de entrada que se ajuste a la fichada de salida. Esto
     * permitira posteriormente determinar la cantidad de horas trabajadas.
     * La fichada de entrada se busca solo un dia hacia atras respecto a la
     * fichada de salida.
     */
    async findFichadaEntradaPrevia(agenteID, fichadaSalida:Date){
        let fechaDesde = this.substractOneDay(fichadaSalida);
        let fechaHasta = fichadaSalida;
        let fichadaIO = await FichadaCache
            .findOne({ 
                'agente._id': Types.ObjectId(agenteID),
                'entrada': { $ne: null },
                'salida':  null ,
                $expr : { $and:
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
            })
            .sort({ fecha: -1 });
        return fichadaIO;
    }


    substractOneDay(fecha){
        let tomorrow = new Date(fecha);
        return new Date(tomorrow.setDate(tomorrow.getDate() - 1));
    }

    diffHours(date1, date2){
        // TODO Implementar!
        return 12;
    }

    parseDate(date){
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    // Backup replica trigger.
    // async getFichadasIO(agenteID, fechaDesde, fechaHasta){
    //     let fichadasIO = [];
    //     let fichadas = await Fichada
    //         .find({ 
    //             'agente.id': Types.ObjectId(agenteID),
    //             esEntrada: { $ne: null },
    //             $expr : { $and:
    //                 [   // Busqueda solo por fecha, sin importar la hora o tz
    //                     { $lte: [
    //                         { $dateToString: { date: "$fecha", format:"%Y-%m-%d"}} ,
    //                         { $dateToString: { date: fechaHasta, format:"%Y-%m-%d"}}
    //                         ]
    //                     },
    //                     { $gte: [
    //                         { $dateToString: { date: "$fecha", format:"%Y-%m-%d"}} ,
    //                         { $dateToString: { date: fechaDesde, format:"%Y-%m-%d"}}
    //                     ]}
    //                 ]}
    //         })
    //         .sort('fecha')
    //         .lean();
        
    //     let fichadaEntrada = false;
    //     for( const fichada of fichadas){
    //         if (fichada.esEntrada){
    //             fichadasIO.push({ entrada: fichada.fecha, salida: null });
    //             fichadaEntrada = true;
    //         }
    //         else{
    //             if (fichadaEntrada){
    //                 fichadasIO[fichadasIO.length-1].salida = fichada.fecha;
    //             }
    //             else{
    //                 fichadasIO.push({ entrada: null, salida: fichada.fecha });
    //             }
    //             fichadaEntrada = false;
    //         }
    //     }
    //     return fichadasIO;
    // }
}

export default FichadaController; 
