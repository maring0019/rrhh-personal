import { Schema, Types, model } from 'mongoose';

export const FichadaCacheSchema = new Schema({
    agente: {
        id: {
            type: Types.ObjectId,
            required: true,
            index: true,
        },
        nombre: String, 
        apellido: String
    },
    fecha:{
        type: Date,
        required: true,
        index: true
    }, 
    entrada: Date,
    salida: Date,
    horasTrabajadas: String

})

export const FichadaCache = model('FichadaCache', FichadaCacheSchema, 'fichadascache');