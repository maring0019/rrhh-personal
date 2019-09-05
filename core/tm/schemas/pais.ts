import { Schema, model } from 'mongoose';


export const PaisSchema = new Schema({
    nombre: {
        type: String,
        index: true,
        required: true,
    },
    gentilicio: String //Nacionalidad
});

PaisSchema.methods._str_ = function(cb) {
    return `${this.nombre}`
  };

export const Pais = model('Pais', PaisSchema, 'paises');
