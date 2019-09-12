import { Schema } from 'mongoose';

import { TipoNormaLegalSchema } from '../../../core/tm/schemas/normalegal';
import { CausaBajaSchema } from '../../../core/tm/schemas/causabaja';

export const BajaSchema = new Schema({
    fecha: Date,
    causa: CausaBajaSchema,
    tipoNormaLegal: TipoNormaLegalSchema,
    numeroNormaLegal: String,
    observaciones: String,
})