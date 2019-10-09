import { Schema, model } from 'mongoose';

export const UbicacionTipoSchema = new Schema({
    codigo: {
        type: Number,
        required: true
    },
    nombre: {
        type: String,
        required: true
    }
})

export const UbicacionTipo = model('UbicacionTipo', UbicacionTipoSchema, 'ubicacionestipo');