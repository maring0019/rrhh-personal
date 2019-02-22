import { Schema, model } from 'mongoose';
import { ProvinciaSchema } from './provincia';

export const LocalidadSchema = new Schema({
    nombre: String,
    pais: { type: ProvinciaSchema}
});

export const Localidad = model('Localidad', LocalidadSchema, 'localidad');
