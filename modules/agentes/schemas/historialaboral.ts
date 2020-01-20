import { Schema } from 'mongoose';

/**
 * 
 */
export const HistoriaLaboralSchema = new Schema({
    // Datos Generales
    tipo: String,
    fecha: Date, // Fecha Norma Legal
    timestamp: Date,
    changeset: Schema.Types.Mixed
});