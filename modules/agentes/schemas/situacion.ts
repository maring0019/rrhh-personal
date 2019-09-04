import { Schema } from 'mongoose';

import { TipoSituacionSchema } from '../../../core/tm/schemas/tiposituacion';

export const SituacionSchema = new Schema({ 
    tipoSituacion: TipoSituacionSchema,
    lugarPago: String,
    exceptuadoFichado: Boolean,
    trabajaEnHospital: Boolean,
    trasladoDesde: String
})

