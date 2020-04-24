import { Schema, Types, model } from 'mongoose';

export const FichadaSchema = new Schema({
    agente: {
        _id: {
            type: Types.ObjectId,
            required: true,
            index: true
        }
    },
    fecha:{
        type: Date,
        required: true,
        index: true
    }, 
    esEntrada: Boolean,
    reloj: Number,
})

export const Fichada = model('Fichada', FichadaSchema, 'fichadas');