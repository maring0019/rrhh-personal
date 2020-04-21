import { Schema, model } from 'mongoose';

import { parseDate } from '../../../core/utils/dates';
import { CargoSchema } from './cargo';
import { RegimenSchema } from './regimen';
import { NormaLegalSchema } from './normaLegal';
import { SituacionSchema } from './situacion';


export const SituacionLaboralSchema = new Schema({
    // Datos Generales
    fechaIngresoEstado: {
        type: Date,
        set: parseDate
    },
    fechaIngresoHospital: {
        type: Date,
        set: parseDate
    },
    antiguedadVacaciones: {
        type:Date,
        set: parseDate
    },
    antiguedadPago: {
        type: Date,
        set: parseDate
    },
    codigoFichado: String,
    normaLegal: NormaLegalSchema,
    situacion: SituacionSchema,
    cargo: CargoSchema,
    regimen: RegimenSchema,
    // Metadatos para utilizar en la historia laboral
    // al registrarse cambios por diferentes motivos
    fecha: {
        type: Date,
        set: parseDate
    },
    motivo: String,
    esAlta: Boolean // Uso interno
});

export const SituacionLaboral = model('SituacionLaboral', SituacionLaboralSchema);