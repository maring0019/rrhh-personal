import { Schema } from 'mongoose';

import { SituacionSchema } from '../../../core/tm/schemas/situacion';

export const SituacionLaboralSchema = new Schema({
    situacion: SituacionSchema,
    situacionLugarPago: String,
    situacionFechaIngresoEstado: Date,
    situacionFechaIngresoHospital: Date,
    antiguedadVacaciones: Date,
    antiguedadPago: Date,
    exceptuadoFichado: Boolean,
    trabajaEnHospital: Boolean,
    trasladoDesde: String,
})

// export const SituacionLaboral = model('SituacionLaboral', SituacionLaboralSchema, 'situacionLaboral');

