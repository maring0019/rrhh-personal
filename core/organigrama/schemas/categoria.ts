import { Schema, model } from 'mongoose';

/**
 * 
 */
export const CategoriaSchema = new Schema({
    nombre:{
        type: String,
        es_indexed: true
    }
});

export const Categoria = model('Categoria', CategoriaSchema, 'categorias');
