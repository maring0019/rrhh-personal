import { Schema, model } from 'mongoose';

/**
 * 
 */
export const TipoNormaLegalSchema = new Schema({
    nombre:{
        type: String,
        index: true,
        required: true,
    }
});


export const TipoNormaLegal = model('TipoNormaLegal', TipoNormaLegalSchema, 'tiposnormalegal');