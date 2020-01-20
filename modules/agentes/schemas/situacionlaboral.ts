import { Schema } from 'mongoose';

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
    // Datos de Interes para la Historia Laboral
    normaLegal: NormaLegalSchema,
    situacion: SituacionSchema,
    cargo: CargoSchema,
    regimen: RegimenSchema
});