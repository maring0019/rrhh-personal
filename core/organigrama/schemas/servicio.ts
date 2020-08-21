import { Schema, model } from 'mongoose';
import { DepartamentoSchema } from './departamento';


export const ServicioSchema = new Schema({
    nombre: {
        type: String,
        index: true,
        required: true,
    }, 
    jefe: String, // ID de un Agente
    departamento: DepartamentoSchema,
    ubicacion: {
        type: Number,
        index: true,
        required: true,
    },
    codigo: {  // TODO Averiguar si es el  interno de base, o es un codigo externo
        type: Number,
        required: true,
    },
    nombreViejo: String
})

ServicioSchema.methods._str_ = function(cb) {
    return `${this.nombre}`
  };

export const Servicio = model('Servicio', ServicioSchema, 'servicios');