import { Schema, model } from 'mongoose';
const audit = require('../../../packages/mongoose-audit-trail');

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

SubPuestoSchema.plugin(audit.plugin, { omit: ["_id", "id"] });

export const SubPuesto = model('SubPuesto', SubPuestoSchema, 'subpuestos');
