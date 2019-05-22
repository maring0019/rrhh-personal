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
        required: true,
    },
    codigo: {  // TODO Averiguar si es el id interno de base, o es un codigo externo
        type: Number,
        required: true,
    },
    nombreViejo: String
})

export const Servicio = model('Servicio', ServicioSchema, 'servicios');