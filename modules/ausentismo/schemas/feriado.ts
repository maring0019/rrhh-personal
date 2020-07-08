import { Schema, model } from 'mongoose';

const audit = require('../../../packages/mongoose-audit-trail');

export const FeriadoSchema = new Schema({
    fecha:{
        type: Date,
        required: true,
        unique: true
    },
    descripcion:String
})


FeriadoSchema.plugin(audit.plugin, { omit: ["_id", "id"] })
export const Feriado = model('Feriado', FeriadoSchema, 'feriados');