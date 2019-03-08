import { Schema } from 'mongoose';
import { constantes } from '../../constants/index';

export const ContactoSchema = new Schema({
    tipo: constantes.CONTACTO,
    valor: String,
    ranking: Number,
    ultimaActualizacion: Date,
    activo: {
        type: Boolean,
        required: true,
        default: true
    },
});