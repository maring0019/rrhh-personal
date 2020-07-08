import { Schema, Types, model } from 'mongoose';

export const NotaSchema = new Schema({
    agente: {
        _id: {
            type: Types.ObjectId,
            required: true,
            index: true
        },
        nombre: String,
        apellido: String
    },
    fecha:{
        type: Date,
        required: true,
        index: true
    },
    usuario: Schema.Types.Mixed,
    titulo: String ,
    detalle: String
})

export const Nota = model('Nota', NotaSchema, 'notas');