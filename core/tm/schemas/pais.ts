import { Schema, model } from 'mongoose';


export const PaisSchema = new Schema({
    nombre: {
        type: String,
        index: true,
        required: true,
    },
    gentilicio: String //Nacionalidad
});

export const Pais = model('Pais', PaisSchema, 'paises');
