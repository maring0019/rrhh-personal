import { Schema } from 'mongoose';

import { TipoSituacionSchema } from '../../../core/tm/schemas/tiposituacion';

export const SituacionSchema = new Schema({
    tipoSituacion: TipoSituacionSchema,
    situacionLugarPago: String,
    situacionFechaIngresoEstado: Date,
    situacionFechaIngresoHospital: Date,
    antiguedadVacaciones: Date,
    antiguedadPago: Date,
    exceptuadoFichado: Boolean,
    trabajaEnHospital: Boolean,
    trasladoDesde: String,
})

