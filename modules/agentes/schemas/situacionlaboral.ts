import { Schema } from 'mongoose';

import { CargoSchema } from './cargo';
import { RegimenSchema } from './regimen';
import { TipoSituacionSchema } from '../../../core/tm/schemas/tiposituacion';
import { NormaLegalSchema } from './normaLegal';

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
    
    // Fix (mover a un nnuevo esquema)
    situacion: TipoSituacionSchema, // Contratado, Permanente, etc
    exceptuadoFichado: Boolean,
    trabajaEnHospital: Boolean,
    trasladoDesde: String,
    lugarPago: String,
    
    cargo: CargoSchema,
    regimen: RegimenSchema
});