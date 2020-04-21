import { Schema } from 'mongoose';

import { TipoNormaLegalSchema } from '../../../core/tm/schemas/normalegal';
import { CausaBajaSchema } from '../../../core/tm/schemas/causabaja';
import { parseDate } from '../../ausentismo/commons/utils';

export const BajaSchema = new Schema({
    fecha: {
        type: Date,
        set: parseDate,
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