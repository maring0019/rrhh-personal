import { Schema, model } from 'mongoose';
const audit = require('../../../packages/mongoose-audit-trail');

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

PuestoSchema.plugin(audit.plugin, { omit: ["_id", "id"] });

export const Puesto = model('Puesto', PuestoSchema, 'puestos');
