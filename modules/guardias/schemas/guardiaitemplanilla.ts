
import { Schema, Types} from 'mongoose';

export const DiaGuardiaSchema = new Schema({
    fecha: Date,
    diaCompleto: Boolean
})

export const GuardiaItemPlanillaSchema = new Schema({
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
    diasGuardia: [DiaGuardiaSchema]
})
    