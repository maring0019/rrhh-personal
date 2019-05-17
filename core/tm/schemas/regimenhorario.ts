import { Schema, model } from 'mongoose';

export const RegimenHorarioSchema = new Schema({
    nombre:{
        type: String,
        es_indexed: true
    }
});

export const RegimenHorario = model('RegimenHorario', RegimenHorarioSchema, 'regimeneshorario');
