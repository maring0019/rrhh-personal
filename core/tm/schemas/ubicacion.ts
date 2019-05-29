import { Schema } from 'mongoose';
import { LocalidadSchema } from './localidad';

export const UbicacionSchema = new Schema({
    barrio: { type: String },
    localidad: { type: LocalidadSchema },
});