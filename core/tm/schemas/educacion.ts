import { Schema } from 'mongoose';
import {constantes } from '../../constants/index';

export const EducacionSchema = new Schema({
    tipo: constantes.ESTUDIOS,
    titulo: String
})