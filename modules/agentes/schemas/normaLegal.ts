import { Schema, model } from 'mongoose';

import { TipoNormaLegalSchema } from '../../../core/tm/schemas/normalegal';
import { parseDate } from '../../../core/utils/dates';

export const NormaLegalSchema = new Schema({
        tipoNormaLegal: TipoNormaLegalSchema,
        numeroNormaLegal: String,
        fechaNormaLegal: {
            type: Date,
            set: parseDate
        },
        observaciones: String,
    }
)

export const NormaLegal = model('NormaLegal', NormaLegalSchema);
