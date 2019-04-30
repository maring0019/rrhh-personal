import { Schema, model } from 'mongoose';

/**
 * Puesto de trabajo
 */
export const SubPuestoSchema = new Schema({
    nombre:{
        type: String,
        es_indexed: true
    }
});

export const SubPuesto = model('SubPuesto', SubPuestoSchema, 'subpuestos');
