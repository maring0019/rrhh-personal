import { Schema, model } from 'mongoose';


/**
 * Situacion en planta de los agentes ingresados al sistema.
 * Ej Contrados, Permanentes, etc
 */
export const SituacionSchema = new Schema({
    nombre: {
        type: String,
        required: true,
        index: true,
    },
    requiereVencimiento: {// Indica si la carga de un agente requerira una fecha de baja automatica
        type: Boolean,
        default: false
    }
});

export const Situacion = model('Situacion', SituacionSchema, 'situacion');
