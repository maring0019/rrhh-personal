import { Schema } from 'mongoose';

import { TipoNormaLegalSchema } from '../../../core/tm/schemas/normalegal';

export const NormaLegalSchema = new Schema({
        tipoNormaLegal: TipoNormaLegalSchema,
        numeroNormaLegal: String,
        fechaNormaLegal: Date,
        observaciones: String,
    }
)
