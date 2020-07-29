import { Schema, Types, model } from 'mongoose';

export const ParteSchema = new Schema({
    idLegacy: Number,              // ID Sistema anterior.
    fecha: {
        type: Date,
        required: true,
        index: true
    },
    ubicacion: {
        // _id: {
        //     type: Types.ObjectId,
        //     required: true
        // },
        codigo: {
            type: Number,
            required: true
        },
        nombre: String
    },
    estado: {
        _id: {
            type: Types.ObjectId,
            required: true
        },
        nombre: String
    },
    procesado: Boolean,
    novedades: Boolean, // Flag. True si al menos uno de los partes de los agentes tiene novedades
    editadoPostProcesado: Boolean, 
    fechaEnvio: Date,
    usuarioEnvio: { // TODO. Consultar: El usuario es siempre un agente?
        _id: {
            type: Types.ObjectId,
            // required: true,
            index: true
        },
        nombre: String, 
        apellido: String
    },
    audit_user: Number,
    audit_fecha: Date
});

export const Parte = model('Parte', ParteSchema, 'partes');