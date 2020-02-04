import { Schema, Types, model } from 'mongoose';

export const ParteAgenteSchema = new Schema({
    parte: {
        _id: {
            type: Types.ObjectId,
            required: true,
            index: true
        }
    },
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
        index: true
    },
    fichadas: {
        entrada: Date,
        salida: Date,
        horasTrabajadas: String,
    },
    ausencia: {
        articulo: { 
            _id: Types.ObjectId,
            codigo: String,
            descripcion: String
        }
    },
    justificacion: {
        _id: Types.ObjectId,
        nombre: String
    },
    observaciones: String
})

export const ParteAgente = model('ParteAgente', ParteAgenteSchema, 'partesagentes');