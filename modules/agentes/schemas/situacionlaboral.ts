import { Schema } from 'mongoose';

import { CargoSchema } from './cargo';
import { RegimenSchema } from './regimen';
import { TipoSituacionSchema } from '../../../core/tm/schemas/tiposituacion';

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
    exceptuadoFichado: Boolean,
    trabajaEnHospital: Boolean,
    trasladoDesde: String,
    lugarPago: String,
    // Datos de Interes para la Historia Laboral
    situacion: TipoSituacionSchema, // Contratado, Permanente, etc
    cargo: CargoSchema,
    regimen: RegimenSchema
})