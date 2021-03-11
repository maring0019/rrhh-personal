import { Schema, model } from 'mongoose';
const audit = require('../../../packages/mongoose-audit-trail');


export const PaisSchema = new Schema({
    nombre: {
        type: String,
        index: true,
        required: true,
        unique: true
    },
    gentilicio: String //Nacionalidad
});

PaisSchema.methods._str_ = function(cb) {
    return `${this.nombre}`
  };

PaisSchema.plugin(audit.plugin, { omit: ["_id", "id"] });

export const Pais = model('Pais', PaisSchema, 'paises');
