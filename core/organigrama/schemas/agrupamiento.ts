import { Schema, model } from 'mongoose';

export const AgrupamientoSchema = new Schema({
    nombre:{
        type: String,
        es_indexed: true
    }
});

export const Agrupamiento = model('Agrupamiento', AgrupamientoSchema, 'agrupamientos');
