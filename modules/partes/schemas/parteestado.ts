import { Schema, model } from 'mongoose';

export const ParteEstadoSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },

})

export const ParteEstado = model('ParteEstado', ParteEstadoSchema, 'parteestados');