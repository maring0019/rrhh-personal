import { Schema, model } from 'mongoose';


export const DireccionSchema = new Schema({
    nombre:{
        type: String,
        index: true,
        required: true,
    },
    jefe: String, // Es un nombre completo (preguntar porque no es un agente)
    ubicacion: {
        type: Number,
        required: true,
    }
})

export const Direccion = model('Direccion', DireccionSchema, 'direcciones');