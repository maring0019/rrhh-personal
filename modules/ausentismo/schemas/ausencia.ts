import { Schema, model, Types } from 'mongoose';
import { CertificadoSchema } from './certificado';

export const AusenciaSchema = new Schema({
    agente: {
        id: {
            type: Types.ObjectId,
            required: true
        }
    }, 
    fecha: Date,
    articulo: {
        id: {
            type: Types.ObjectId,
            required: true
        },
        codigo: {
            type: String,
            required: true
        }
    },
    observacion: String,
    adicional: String,
    extra: String,
    adjuntos: Array,
    certificado: CertificadoSchema

})

export const Ausencia = model('Ausencia', AusenciaSchema, 'ausencias');