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
        },
        descripcion: String
    },
    fechaDesde: {
        type: Date,
        required: true
    },
    fechaHasta: {
        type: Date,
        required: true,
        es_indexed: true
    },
    cantidadDias: {
        type: Number,
        required: true
    },
    observacion: String,
    adicional: String,
    extra: String,
    adjuntos: Array,
    certificado: CertificadoSchema,
    ausencias: [AusenciaSchema]
});

// TODO CREATE INDEX!!!!!
// db.getCollection('ausenciasperiodo').createIndex( { "agente.id": 1, "articulo.id": 1, "fechaDesde":1, "fechaHasta":1, } )

export const AusenciaPeriodo = model('AusenciaPeriodo', AusenciaPeriodoSchema, 'ausenciasperiodo');
