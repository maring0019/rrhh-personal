import { Schema, model } from 'mongoose';
import { ProvinciaSchema } from './provincia';

export const LocalidadSchema = new Schema({
    nombre: {
        type: String,
        index: true,
        required: true,
    },
    provincia: { type: ProvinciaSchema }
});

export const Localidad = model('Localidad', LocalidadSchema, 'localidad');
