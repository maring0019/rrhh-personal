import { Schema, Types, model } from 'mongoose';
import { CertificadoSchema } from './certificado';
import { AusenciaSchema } from './ausencia';
// import { IndicadorAusentismoSchema } from './indicador';

export const AusenciaPeriodoSchema = new Schema({
    agente: {
        _id: {
            type: Types.ObjectId,
            required: true
        }
    }, 
    articulo: {
        _id: {
            type: Types.ObjectId,
            required: true
        },
        codigo: {
            type: String,
            required: true
        },
        descripcion: String,
        color: String
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
    ausencias: [AusenciaSchema],
    // indicadoresHistoricos: [IndicadorAusentismoSchema]
});

// TODO CREATE INDEX!!!!!
// db.getCollection('ausenciasperiodo').createIndex( { "agente._id": 1, "articulo._id": 1, "fechaDesde":1, "fechaHasta":1, } )

export const AusenciaPeriodo = model('AusenciaPeriodo', AusenciaPeriodoSchema, 'ausenciasperiodo');
