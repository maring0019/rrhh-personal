import { Schema, model } from 'mongoose';

export const CertificadoSchema = new Schema({
    fechaInicio: Date,
    fechaFin: Date,
    observaciones: String
})

export const Certificado = model('Certificado', CertificadoSchema, 'certificados');