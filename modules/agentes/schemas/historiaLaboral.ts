import { Schema } from 'mongoose';

import { SituacionLaboralSchema } from './situacionLaboral';
import { CargoSchema } from './cargo';
import { TipoNormaLegalSchema } from '../../../core/tm/schemas/normalegal';
import { RegimenSchema } from './regimen';

/**
 * Historia Laboral del Agente
 */
export const HistoriaLaboralSchema = new Schema({
    tipoNormaLegal: TipoNormaLegalSchema,
    numeroNormaLegal: String,
    fechaNormaLegal: Date,
    situacion: SituacionLaboralSchema,
    cargo: CargoSchema,
    regimen: RegimenSchema,
    inactivo:{
        type: Boolean,
        default: false
    }
})