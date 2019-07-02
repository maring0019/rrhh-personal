import { Schema, Types, model } from 'mongoose';
import { CertificadoSchema } from './certificado';
import { AusenciaSchema } from './ausencia';

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
    fechaHasta: {
        type: Date,
        required: true
    },
    cantidadDias: {
        type: Number,
        required: true
    },
    observacion: String,
    adicional: String,
    extra: String,
    ausencias: [AusenciaSchema],
    adjuntos: Array,
    certificado: CertificadoSchema,
});

export const AusenciaPeriodo = model('AusenciaPeriodo', AusenciaPeriodoSchema, 'ausenciasperiodo');
