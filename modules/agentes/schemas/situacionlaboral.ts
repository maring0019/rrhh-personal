import { Schema, model } from 'mongoose';

import { CargoSchema } from './cargo';
import { RegimenSchema } from './regimen';
import { NormaLegalSchema } from './normaLegal';
import { SituacionSchema } from './situacion';

/**
 * 
 */
export const SituacionLaboralSchema = new Schema({
    // Datos Generales
    fechaIngresoEstado: Date,
    fechaIngresoHospital: Date,
    antiguedadVacaciones: Date,
    antiguedadPago: Date,
    codigoFichado: String,
    normaLegal: NormaLegalSchema,
    situacion: SituacionSchema,
    cargo: CargoSchema,
    regimen: RegimenSchema,
    // Metadatos para utilizar en la historia laboral
    // al registrarse cambios por diferentes motivos
    fecha: Date,
    motivo: String,
    esAlta: Boolean // Uso interno
});

export const SituacionLaboral = model('SituacionLaboral', SituacionLaboralSchema);