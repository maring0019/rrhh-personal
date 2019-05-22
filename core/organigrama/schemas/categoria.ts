import { Schema, model } from 'mongoose';

/**
 * 
 */
export const CategoriaSchema = new Schema({
    nombre:{
        type: String,
        index: true,
        required: true,
    }
});

export const Categoria = model('Categoria', CategoriaSchema, 'categorias');
