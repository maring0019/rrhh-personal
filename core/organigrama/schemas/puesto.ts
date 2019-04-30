import { Schema, model } from 'mongoose';

/**
 * Puesto de trabajo
 */
export const PuestoSchema = new Schema({
    nombre:{
        type: String,
        es_indexed: true
    }
});

export const Puesto = model('Puesto', PuestoSchema, 'puestos');
