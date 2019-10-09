import { Schema, model } from 'mongoose';

export const ParteJustificacionSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    hint: String
})

export const ParteJustificacion = model('ParteJustificacion', ParteJustificacionSchema, 'partejustificaciones');