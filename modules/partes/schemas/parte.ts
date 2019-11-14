import { Schema, Types, model } from 'mongoose';

export const ParteSchema = new Schema({
    idLegacy: Number,              // ID Sistema anterior.
    fecha: {
        type: Date,
        required: true,
        index: true
    },
    ubicacion: {
        id: {
            type: Types.ObjectId,
            required: true
        },
        nombre: String
    },
    estado: {
        id: {
            type: Types.ObjectId,
            required: true
        },
        nombre: String
    },
    procesado: Boolean,
    fechaEnvio: Date,
    usuarioEnvio: { // TODO. Consultar: El usuario es siempre un agente?
        id: {
            type: Types.ObjectId,
            // required: true,
            index: true
        },
        nombre: String, 
        apellido: String
    },
    audit_user: Number,
    audit_fecha: Date
})

export const Parte = model('Parte', ParteSchema, 'partes');