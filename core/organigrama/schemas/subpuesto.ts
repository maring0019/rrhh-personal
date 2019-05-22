import { Schema, model } from 'mongoose';

/**
 * Puesto de trabajo
 */
export const SubPuestoSchema = new Schema({
    nombre:{
        type: String,
        index: true,
        required: true,
    }
});

export const SubPuesto = model('SubPuesto', SubPuestoSchema, 'subpuestos');
