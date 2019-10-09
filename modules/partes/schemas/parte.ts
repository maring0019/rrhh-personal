import { Schema, Types, model } from 'mongoose';

export const ParteSchema = new Schema({
    fecha: {
        type: Date,
        required: true,
        index: true
    },
    ubicacion: {
        id: {
            type: Types.ObjectId,
            required: true
        },
        nombre: String
    },
    estado: {
        id: {
            type: Types.ObjectId,
            required: true
        },
        nombre: String
    },
    procesado: Boolean,
    audit_user: Number,
    audit_fecha: Date
})

export const Parte = model('Parte', ParteSchema, 'partes');