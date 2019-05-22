import { Schema, model } from 'mongoose';

export const RegimenHorarioSchema = new Schema({
    nombre:{
        type: String,
        index: true,
        required: true,
    }
});

export const RegimenHorario = model('RegimenHorario', RegimenHorarioSchema, 'regimeneshorario');
