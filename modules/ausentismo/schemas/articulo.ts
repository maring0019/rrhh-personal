import { Schema, model } from 'mongoose';
import { FormulaSchema } from './formula';

export const ArticuloSchema = new Schema({
    
    idInterno: {                  // Codigo Interno Sistema Anterior. TODO Remover si no es mas necesario
        type: Number
    },
    codigo: {                     // Codigo alfanumerico
        type: String,
        required: true
    },
    nombre: {                     // Nombre del articulo
        type: String,
        required: true
    },
    descripcion: String,
    color: String,                 // Verde claro=#5cb85c, rojo= #d9534f
    diasCorridos: Boolean,         // Indica si los dias a ausencia son corridos
    diasHabiles: Boolean,          // Indica si los dias a ausencia son habiles
    descuentaDiasLicencia: Boolean,// Para uso de articulos especiales que descuentan dias de licencia
    formulas: [FormulaSchema],     // Conjunto de restricciones/validaciones a aplicar al momento de
                                   // crear o actualizar un ausentismo.   
    
    // Los siguientes atributos se mantienen como parte legacy del sistema
    // anterior, pero no son utilizados actualmente. 
    grupo: Number,                         // TODO Consultar este dato
    limitado: Boolean,                     // TODO consultar este dato
    requiereInformacionAdicional: Boolean, // TODO consultar este dato
    tituloInformacionAdicional: String,
    codigoOTI: String
})

export const Articulo = model('Articulo', ArticuloSchema, 'articulos');