import { Schema, model } from 'mongoose';

/**
 * 
 */
export const TipoNormaLegalSchema = new Schema({
    nombre:{
        type: String,
        es_indexed: true
    }
});


export const TipoNormaLegal = model('TipoNormaLegal', TipoNormaLegalSchema, 'tiposnormalegal');