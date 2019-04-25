import { Schema } from 'mongoose';
import { constantes } from '../../constants/index';

export const ContactoSchema = new Schema({
    tipo: constantes.CONTACTO,
    valor: {
        type: String,
        required:true
    },
    ranking: Number,
    ultimaActualizacion: Date,
    activo: {
        type: Boolean,
        default: true
    },
});