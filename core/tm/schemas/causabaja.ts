import { Schema, model } from 'mongoose';

/**
 * Almacena las causas por las cuales un agente puede ser dado
 * de baja.
 */
export const CausaBajaSchema = new Schema({
    nombre:{
        type: String,
        index: true,
        required: true,
    }
});


export const CausaBaja = model('CausaBaja', CausaBajaSchema, 'causasbajas');