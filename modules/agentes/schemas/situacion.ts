import { Schema } from 'mongoose';

import { TipoSituacionSchema } from '../../../core/tm/schemas/tiposituacion';
import { parseDate } from '../../../core/utils/dates';

export const SituacionSchema = new Schema({ 
    tipoSituacion: TipoSituacionSchema,
    fechaBajaProgramada: {
        type: Date,
        set: parseDate
    },
    lugarPago: String,
    exceptuadoFichado: Boolean,
    trabajaEnHospital: Boolean,
    trasladoDesde: String
})

