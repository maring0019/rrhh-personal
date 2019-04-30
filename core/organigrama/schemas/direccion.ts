import { Schema, model } from 'mongoose';


export const DireccionSchema = new Schema({
    nombre:{
        type: String,
        es_indexed: true
    },
    jefe: String, // Es un nombre completo (preguntar porque no es un agente)
    ubicacion: {
        type: Number,
        required: true,
    }
})

export const Direccion = model('Direccion', DireccionSchema, 'direcciones');