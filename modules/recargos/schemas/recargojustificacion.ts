const audit = require('../../../packages/mongoose-audit-trail');
import { Schema, model } from 'mongoose';


export const RecargoJustificacionSchema = new Schema({
    nombre: String,
    observaciones: String
});

RecargoJustificacionSchema.plugin(audit.plugin, { omit: ["_id", "id"] })

export const RecargoJustificacion = model('RecargoJustificacion', RecargoJustificacionSchema, 'recargosjustificaciones');