import { Schema, model } from 'mongoose';


export const SectorSchema = new Schema({
    nombre:{
        type: String,
        es_indexed: true
    },
    jefe: String,     // Referencia codigo Agente? TODO: Consultar
    servicio: String, // Referencia codigo Servicio? TODO: Consultar
    ubicacion: {
        type: Number,
        required: true,
    },
    nombreViejo: String
})

export const Sector = model('Sector', SectorSchema, 'sectores');