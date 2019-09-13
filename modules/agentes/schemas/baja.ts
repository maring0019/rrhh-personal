import { Schema } from 'mongoose';

import { TipoNormaLegalSchema } from '../../../core/tm/schemas/normalegal';
import { CausaBajaSchema } from '../../../core/tm/schemas/causabaja';

export const BajaSchema = new Schema({
    fecha: {
        type: Date,
        required: true
    },
    causa:{
        type:CausaBajaSchema,
        required: true
    },
    tipoNormaLegal: TipoNormaLegalSchema,
    numeroNormaLegal: String,
    observaciones: String,
})