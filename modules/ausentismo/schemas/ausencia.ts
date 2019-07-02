import { Schema, model, Types } from 'mongoose';

export const AusenciaSchema = new Schema({
    agente: {
        id: {
            type: Types.ObjectId,
            required: true
        }
    }, 
    fecha: Date,
    articulo: {
        id: {
            type: Types.ObjectId,
            required: true
        },
        codigo: {
            type: String,
            required: true
        }
    },
    // observacion: String,
    // adicional: String,
    // extra: String
})

export const Ausencia = model('Ausencia', AusenciaSchema, 'ausencias');