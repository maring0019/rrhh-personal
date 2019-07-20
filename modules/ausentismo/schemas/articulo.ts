import { Schema, model } from 'mongoose';
import { FormulaSchema } from './formula';

export const ArticuloSchema = new Schema({
    idInterno: {                         // Codigo Interno Sistema Anterior. TODO Remover si no es mas necesario
        type: Number,
        required: true
    },
    codigo: {
        type: String,
        required: true
    },
    nombre: {
        type: String,
        required: true
    },
    descripcion: String,
    grupo: Number,                         // TODO Consultar este dato
    limitado: Boolean,                     // TODO consultar este dato
    requiereInformacionAdicional: Boolean, // TODO consultar este dato
    tituloInformacionAdicional: String,
    codigoOTI: String,
    diasCorridos: Boolean,
    diasHabiles: Boolean,                     // TODO consultar este dato
    formulas: [FormulaSchema]
})

export const Articulo = model('Articulo', ArticuloSchema, 'articulos');