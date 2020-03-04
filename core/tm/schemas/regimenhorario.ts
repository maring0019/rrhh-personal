import { Schema, model } from 'mongoose';

export const RegimenHorarioSchema = new Schema({
    nombre:{
        type: String,
        index: true,
        required: true,
    },
    activo: {
        // Indica si el tipo de situacion esta activo para uso en el sistema
        type: Boolean,
        default: true
    }
});

export const RegimenHorario = model('RegimenHorario', RegimenHorarioSchema, 'regimeneshorario');
