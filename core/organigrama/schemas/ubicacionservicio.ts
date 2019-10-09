import { Schema, model } from 'mongoose';

export const UbicacionServicioSchema = new Schema({
    // padre: TODO Queda pendiente definir esta relacion
    codigo: {
        type: Number,
        index: true,
        required: true,
    }, 
    nombre: {
        type: String,
        index: true,
        required: true,
    }, 
    nombreCorto: String,
    interno: Boolean,
    tipo: {
        type: Number,
        index: true,
        required: true
    },
    subtipo: Number,
    telefono: String,
    despachoHabilitado: Boolean
})

export const UbicacionServicio = model('UbicacionServicio', UbicacionServicioSchema, 'ubicacionesservicios');