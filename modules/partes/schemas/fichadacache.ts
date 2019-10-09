import { Schema, Types, model } from 'mongoose';

export const FichadaCacheSchema = new Schema({
    agente: {
        id: {
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
    entrada: Date,
    salida: Date

})

export const FichadaCache = model('FichadaCache', FichadaCacheSchema, 'fichadas');