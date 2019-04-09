import { Schema, model } from 'mongoose';


export const PaisSchema = new Schema({
    nombre: {
        type: String,
        required: true,
    },
    gentilicio: String //Nacionalidad
});

export const Pais = model('Pais', PaisSchema, 'paises');
