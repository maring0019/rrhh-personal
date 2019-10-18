import { Schema, Types, model } from 'mongoose';
import { ParteJustificacionSchema } from './partejustificacion';

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
        index: true
    },
    fichadas: {
        entrada: Date,
        salida: Date,
        horasTrabajadas: String,
    },
    ausencia: {
        articulo: { 
            id: Types.ObjectId,
            codigo: String,
            descripcion: String
        }
    },
    justificacion: ParteJustificacionSchema,
    observaciones: String
})

export const ParteAgente = model('ParteAgente', ParteAgenteSchema, 'partesagentes');