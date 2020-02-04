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
    format: String,
    data1: String,
    data2: String

})

export const Fichada = model('Fichada', FichadaSchema, 'fichadas');