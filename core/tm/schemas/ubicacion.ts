import { Schema } from 'mongoose';

export const UbicacionSchema = new Schema({
    barrio: { type: String },
    localidad: {
        type: String,
        required: false
    },
    provincia: {
        type: String,
        required: false
    },
    pais: {
        type: String,
        required: false
    }
});
