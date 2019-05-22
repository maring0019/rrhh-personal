import { Schema } from 'mongoose';
import { LocalidadSchema } from './localidad';


export const BarrioSchema = new Schema({
    nombre: String,
    localidad: LocalidadSchema
});
