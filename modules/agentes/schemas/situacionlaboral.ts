import { Schema } from 'mongoose';

import { CargoSchema } from './cargo';
import { TipoNormaLegalSchema } from '../../../core/tm/schemas/normalegal';
import { RegimenSchema } from './regimen';
import { SituacionSchema } from './situacion';

/**
 * Historia Laboral del Agente
 */
export const SituacionLaboralSchema = new Schema({
    tipoNormaLegal: TipoNormaLegalSchema,
    numeroNormaLegal: String,
    fechaNormaLegal: Date,
    situacion: SituacionSchema,
    cargo: CargoSchema,
    regimen: RegimenSchema,
    inactivo:{
        type: Boolean, 
        default: false
    }
})