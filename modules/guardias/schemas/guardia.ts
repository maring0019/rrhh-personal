
import { Schema, Types, model } from 'mongoose';
import { GuardiaPeriodoSchema } from './guardiaperiodo';
import { GuardiaItemPlanillaSchema } from './guardiaitemplanilla';


export const GuardiaSchema = new Schema({
    
    periodo: GuardiaPeriodoSchema,
    servicio: {
        id: {
            type: Types.ObjectId,
            required: true
        },
        nombre: String
    },
    tipoGuardia: String,
    categoria: {
        id: {
            type: Types.ObjectId,
            required: true
        },
        nombre: String
    },
    planilla: [GuardiaItemPlanillaSchema],
    estado: String,
    fechaEntrega: Date,
    responsableEntrega: {
        id: {
            type: Types.ObjectId,
            required: true,
            index: true
        },
        nombre: String,
        apellido: String
    },
    validado: Boolean,
    responsableValidacion: { // Agente de Gestion de Personal
        id: {
            type: Types.ObjectId,
            required: true,
            index: true
        },
        nombre: String,
        apellido: String
    },
    fechaValidacion: Date
})

export const Guardia = model('Guardia', GuardiaSchema, 'guardias');