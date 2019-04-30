import { Schema, model } from 'mongoose';
import { DireccionSchema } from './direccion';


export const DepartamentoSchema = new Schema({
    nombre:{
        type: String,
        es_indexed: true
    },
    jefe: String, // ID de un Agente
    direccion: DireccionSchema,
    ubicacion: {
        type: Number,
        required: true,
    }
})


export const Departamento = model('Departamento', DepartamentoSchema, 'departamentos');