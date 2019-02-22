import { Schema, model } from 'mongoose';
import { LocalidadSchema } from './localidad';


export const BarrioSchema = new Schema({
    nombre: String,
    localidad: LocalidadSchema
});

export const Barrio = model('Barrio', BarrioSchema, 'barrio');
