import { Schema, model } from 'mongoose';
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
    ultimaActualizacion: Date,
});


export const DireccionContacto = model('DireccionContacto', DireccionSchema);