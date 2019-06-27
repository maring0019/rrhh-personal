import { Schema, Types, model } from 'mongoose';
import { CertificadoSchema } from './certificado';

export const AusenciaPeriodoSchema = new Schema({
    agente: {
        id: {
            type: Types.ObjectId,
            required: true
        }
    }, 
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
    fechaDesde: {
        type: Date,
        required: true
    },
    fechaHasta: Date,
    cantidadDias: Number,
    observacion: String,
    adjuntos: Array,
    certificado: CertificadoSchema
});

export const AusenciaPeriodo = model('AusenciaPeriodo', AusenciaPeriodoSchema, 'ausenciasPeriodo');
