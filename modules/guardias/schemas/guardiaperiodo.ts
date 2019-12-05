import { Schema, model } from 'mongoose';

export const GuardiaPeriodoSchema = new Schema({
    fechaDesde: Date,
    fechaHasta: Date,
    nombre: String
})


export const GuardiaPeriodo = model('GuardiaPeriodo', GuardiaPeriodoSchema, 'guardiaperiodos');