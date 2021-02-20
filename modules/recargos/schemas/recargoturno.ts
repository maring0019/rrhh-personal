import { Schema, model } from 'mongoose';
const audit = require('../../../packages/mongoose-audit-trail');

export const RecargoTurnoSchema = new Schema({
    nombre: String,
    observaciones: String
})

RecargoTurnoSchema.plugin(audit.plugin, { omit: ["_id", "id"] })

export const RecargoTurno = model('RecargoTurno', RecargoTurnoSchema, 'recargosturnos');