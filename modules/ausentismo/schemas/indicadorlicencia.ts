import { Schema, model, Types } from 'mongoose';

export const IndicadorLicenciaSchema = new Schema({
    agente: {
        _id: {
            type: Types.ObjectId,
            required: true
        },
        nombre: String,
        apellido: String,
        numero: String
    },
    articulo: {
        _id: {
            type: Types.ObjectId,
            required: true
        },
        codigo: String
    },
    vigencia: Number,
    totales: Number,
    ejecutadas: Number,
    ejecutadas96L: Number,
    vencido: Boolean
})

export const IndicadorLicencia = model('IndicadorLicencia', IndicadorLicenciaSchema, 'indicadoresLicencia');