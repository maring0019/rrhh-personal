import { Schema, Types, model } from 'mongoose';
import { ParteJustificacion } from './partejustificacion';

export const ParteAgenteSchema = new Schema({
    parte: {
        id: {
            type: Types.ObjectId,
            required: true,
            index: true
        }
    },
    agente: {
        id: {
            type: Types.ObjectId,
            required: true,
            index: true
        },
        nombre: String, 
        apellido: String
    },
    fecha:{
        type: Date,
        required: true,
        index: true
    }, 
    fechaHoraEntrada: Date,
    fechaHoraSalida: Date,
    horasTrabajadas: String,
    articulo: { 
        id: Types.ObjectId,
        codigo: String
    },
    justificacion: ParteJustificacion
})

export const ParteAgente = model('ParteAgente', ParteAgenteSchema, 'partesagentes');