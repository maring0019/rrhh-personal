import { Schema } from 'mongoose';
import { UbicacionSchema } from './ubicacion';


export const DireccionSchema = new Schema({
    // tipo: {
    //     type: String,
    //     required: false
    // },
    valor: String,
    codigoPostal: String,
    ubicacion: { type: UbicacionSchema},
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
