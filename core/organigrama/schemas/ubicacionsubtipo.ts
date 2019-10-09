import { Schema, model } from 'mongoose';

export const UbicacionSubtipoSchema = new Schema({
    codigo: {
        type: Number,
        required: true
    },
    nombre: {
        type: String,
        required: true
    }
})

export const UbicacionSubtipo = model('UbicacionSubtipo', UbicacionSubtipoSchema, 'ubicacionessubtipo');