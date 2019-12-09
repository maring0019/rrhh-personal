
import { Schema, Types, model } from 'mongoose';
import { GuardiaPeriodoSchema } from './guardiaperiodo';
import { GuardiaItemPlanillaSchema } from './guardiaitemplanilla';
import { constantes } from '../../../core/constants';


export const GuardiaSchema = new Schema({
    
    periodo: GuardiaPeriodoSchema,
    servicio: {
        id: {
            type: Types.ObjectId,
            required: true
        },
        nombre: String
    },
    tipoGuardia: constantes.TIPOGUARDIA,
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
            type: Types.ObjectId
        },
        nombre: String,
        apellido: String
    },
    // validado: Boolean,
    responsableValidacion: { // Agente de Gestion de Personal
        id: {
            type: Types.ObjectId
        },
        nombre: String,
        apellido: String
    },
    fechaValidacion: Date
});

GuardiaSchema.index({
    periodo: 1,
    servicio: 1,
    categoria: 1,
    tipoGuardia: 1
  }, {
    unique: true,
  });

export const Guardia = model('Guardia', GuardiaSchema, 'guardias');