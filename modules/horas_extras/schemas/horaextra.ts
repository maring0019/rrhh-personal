import { Schema, Types, model } from 'mongoose';
import { HoraExtraItemPlanillaSchema } from './horaextraitemplanilla';


export const HoraExtraSchema = new Schema({
    mes: {
        id: {
            type: Number,
            required: true
        },
        nombre:{
            type: String,
            required: true
        }
    },
    anio: {
        type: Number,
        required: true
    },
    servicio: {
        type: {
            _id: {
                type: Types.ObjectId,
                required: true
            },
            nombre: String,
            codigo: Number
        },
        required: true
    }, 
    planilla: [HoraExtraItemPlanillaSchema],
    estado: String,
    fechaHoraEntrega: Date,
    responsableEntrega: {
        _id: {
            type: Types.ObjectId
        },
        nombre: String,
        apellido: String
    },
    responsableProcesamiento: { // Agente de Gestion de Personal
        _id: {
            type: Types.ObjectId
        },
        nombre: String,
        apellido: String
    },
    fechaHoraProcesamiento: Date
});

export const HoraExtra = model('HoraExtra', HoraExtraSchema, 'horasextras');