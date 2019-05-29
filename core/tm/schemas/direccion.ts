import { Schema } from 'mongoose';
import { LocalidadSchema } from './localidad';


export const DireccionSchema = new Schema({
    valor: String,
    codigoPostal: String,
    barrio: { type: String },
    localidad: { type: LocalidadSchema },
    geoReferencia: {
        type: [Number],
        index: '2d'
    },
    // Info extra complementaria
    calleIzquierda: String,
    calleDerecha: String,
    calleParalela: String,
    complementarios: String, 
    activo: {
        type: Boolean,
        required: true,
        default: true
    },
    ultimaActualizacion: Date,
});
