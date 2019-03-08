import { Schema } from 'mongoose';


export const SectorSchema = new Schema({
    jefe: String,
    departamento: String,
    ubicacion: String
})