import { Schema, model } from 'mongoose';

export const AgrupamientoSchema = new Schema({
    nombre:
        {
            type: String,
            required: true,
        }
});

export const Agrupamiento = model('Agrupamiento', AgrupamientoSchema, 'agrupamientos');
