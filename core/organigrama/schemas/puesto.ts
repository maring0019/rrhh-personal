import { Schema, model } from 'mongoose';

/**
 * Puesto de trabajo
 */
export const PuestoSchema = new Schema({
    nombre:{
        type: String,
        index: true,
        required: true,
    }
});

export const Puesto = model('Puesto', PuestoSchema, 'puestos');
