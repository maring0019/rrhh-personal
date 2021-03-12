import { Schema, model, Types } from 'mongoose';

export const ProvinciaSchema = new Schema({
    nombre: String,
    pais: {
        _id: {
            type: Types.ObjectId,
            required: true
        },
        nombre: String,
        gentilicio: String
    }
});

export const Provincia = model('Provincia', ProvinciaSchema, 'provincias');
