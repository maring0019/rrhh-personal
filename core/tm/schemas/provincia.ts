import { Schema, model } from 'mongoose';
import { PaisSchema } from './pais';

export const ProvinciaSchema = new Schema({
    nombre: String,
    pais: { type: PaisSchema}
});

export const Provincia = model('Provincia', ProvinciaSchema, 'provincias');
