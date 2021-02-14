
import { Schema, Types,  model } from 'mongoose';
import { constantes } from '../../../core/constants';

// const audit = require('../../../packages/mongoose-audit-trail');

export const GuardiaLoteSchema = new Schema({
    numero: {
        type: String,
        required: true
    },
    servicio: {
        type: {
            _id: {
                type: Types.ObjectId,
                required: true
            },
            nombre: String,
            codigo: Number
        },
        required: true
    },
    tipoGuardia: constantes.TIPOGUARDIA,
    categoria: {
        type: {
            _id: {
                type: Types.ObjectId,
                required: true
            },
            nombre: String
        },
        required: true
    }
});


// GuardiaLoteSchema.plugin(audit.plugin, { omit: ["_id", "id"] })

export const GuardiaLote = model('GuardiaLote', GuardiaLoteSchema, 'guardiaslotes');