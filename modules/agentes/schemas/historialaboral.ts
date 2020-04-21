import { Schema } from 'mongoose';

/**
 * 
 */
export const HistoriaLaboralSchema = new Schema({
    // Datos Generales
    tipo: String,
    timestamp: Date,
    changeset: Schema.Types.Mixed
});