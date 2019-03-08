import { Schema } from 'mongoose';


export const ServicioSchema = new Schema({
    jefe: String,
    departamento: String,
    ubicacion: String
})