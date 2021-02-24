import { Schema, Types} from 'mongoose';

export const ItemPlanillaSchema = new Schema({
    fecha: Date,
    turno: {
        _id: {
            type: Types.ObjectId,
            required: true,
        },
        nombre: String,
        observaciones: String
    },
    justificacion: {
        _id: {
            type: Types.ObjectId,
            required: true,
        },
        nombre: String,
        observaciones: String
    },
    observaciones: String

})


export const RecargoItemPlanillaSchema = new Schema({
    agente: {
        _id: {
            type: Types.ObjectId,
            required: true,
            index: true,
        },
        nombre: String, 
        apellido: String,
        numero: String
    },
    items: [ItemPlanillaSchema]
})
    