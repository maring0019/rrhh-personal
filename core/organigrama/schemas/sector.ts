import { Schema, model } from 'mongoose';
import { ServicioSchema } from './servicio';


export const SectorSchema = new Schema({
    nombre:{
        type: String,
        es_indexed: true
    },
    jefe: String, // Referencia codigo Agente
    servicio: ServicioSchema,
    ubicacion: {
        type: Number,
        required: true,
    },
    nombreViejo: String
})

export const Sector = model('Sector', SectorSchema, 'sectores');