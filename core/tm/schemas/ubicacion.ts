import { Schema } from 'mongoose';
import { ProvinciaSchema } from './provincia';

export const UbicacionSchema = new Schema({
    barrio: { type: String },
    localidad: {
        type: String,
        required: false
    },
    provincia: {
         type: ProvinciaSchema
    }
});