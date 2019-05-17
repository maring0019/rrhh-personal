import { Schema } from 'mongoose';

import { RegimenHorarioSchema } from '../../../core/tm/schemas/regimenhorario';

export const RegimenSchema = new Schema({
    regimenHorario : RegimenHorarioSchema,
    prolongacionJornada: String,
    actividadCritica: String,
    tiempoPleno: {
        type: Boolean,
        default: false
    },
    dedicacionExclusiva: {
        type: Boolean,
        default: false
    },
    guardiasPasivas: {
        type: Boolean,
        default: false
    },
    guardiasActivas: {
        type: Boolean,
        default: false
    }
})