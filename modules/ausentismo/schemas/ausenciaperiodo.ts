import { Schema, Types, model } from 'mongoose';
import { CertificadoSchema } from './certificado';
import { AusenciaSchema } from './ausencia';
// import { IndicadorAusentismoSchema } from './indicador';

export const AusenciaPeriodoSchema = new Schema({
    agente: {
        _id: {
            type: Types.ObjectId,
            required: true,
            index: true
        }
    }, 
    articulo: {
        _id: {
            type: Types.ObjectId,
            required: true,
            index: true
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
        required: true,
        index: true
    },
    fechaHasta: {
        type: Date,
        required: true,
        es_indexed: true,
        index: true
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
    // TODO Definir Schema para Informacion de Certificados Medicos
    // [Numero de Certificado]
    // ,[Fecha Inicio]
    // ,[Fecha Fin]
    // ,[Medico]
    // ,[Prestador]
    // ,[Fecha Inicio Aprobada]
    // ,[Fecha Fin Aprobada]
    // ,[Articulo]
    // ,[Diagnostico_Descripcion]
    // ,[Diagnostico_Causa]
    // ,[Diagnostico_Subcausa]
    // ,[Observaciones]
    // ,[Aprobado]
    // ,[Cargado]
});

export const AusenciaPeriodo = model('AusenciaPeriodo', AusenciaPeriodoSchema, 'ausenciasperiodo');
