import { Schema, model } from 'mongoose';


export const PaisSchema = new Schema({
    nombre: String,
    gentilicio: String //Nacionalidad
});

export const Pais = model('Pais', PaisSchema, 'paises');
