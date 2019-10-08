import { Schema, model } from 'mongoose';

export const ParteSchema = new Schema({
    
    // idInterno: {                        // Codigo Interno Sistema Anterior. TODO Remover si no es mas necesario
    //     type: Number
    // },
    // codigo: {
    //     type: String,
    //     required: true
    // },
    // nombre: {
    //     type: String,
    //     required: true
    // },
    // descripcion: String,
    // color: String,                     // Verde claro=#5cb85c, rojo= #d9534f
    // diasCorridos: Boolean,
    // diasHabiles: Boolean,
    // descuentaDiasLicencia: Boolean,
    // formulas: [FormulaSchema],
    
    // // Los siguientes atributos se mantienen como parte legacy del sistema
    // // anterior, pero no son utilizados actualmente. 
    // grupo: Number,                         // TODO Consultar este dato
    // limitado: Boolean,                     // TODO consultar este dato
    // requiereInformacionAdicional: Boolean, // TODO consultar este dato
    // tituloInformacionAdicional: String,
    // codigoOTI: String
})

export const Parte = model('Parte', ParteSchema, 'partes');