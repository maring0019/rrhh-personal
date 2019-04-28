import { Schema, model } from 'mongoose';
import {constantes } from '../../constants/index';

export const EducacionSchema = new Schema({
    tipoEducacion: constantes.ESTUDIOS,
    titulo: {
        type: String,
        required: true,
        index: true,
    },
})

export const Educacion = model('Educacion', EducacionSchema, 'educacion');