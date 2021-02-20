import { Schema, model } from 'mongoose';


export const RecargoJustificacionSchema = new Schema({
    nombre: String,
    observaciones: String
})

export const RecargoJustificacion = model('RecargoJustificacion', RecargoJustificacionSchema, 'recargosjustificaciones');