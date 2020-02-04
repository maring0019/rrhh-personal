
import { Schema, Types,  model } from 'mongoose';
import { constantes } from '../../../core/constants';


export const GuardiaLoteSchema = new Schema({
    numero: {
        type: String,
        required: true
    },
    servicio: {
        type: {
            _id: {
                type: Types.ObjectId,
                required: true
            },
            nombre: String,
            codigo: Number
        },
        required: true
    },
    tipoGuardia: constantes.TIPOGUARDIA,
    categoria: {
        type: {
            _id: {
                type: Types.ObjectId,
                required: true
            },
            nombre: String
        },
        required: true
    }
});


export const GuardiaLote = model('GuardiaLote', GuardiaLoteSchema, 'guardiaslotes');