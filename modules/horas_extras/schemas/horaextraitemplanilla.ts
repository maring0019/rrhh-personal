import { Schema, Types} from 'mongoose';


export const HoraExtraItemPlanillaSchema = new Schema({
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
    horasSimples: Number,
    horasSemiDobles: Number,
    horasDobles: Number
})
    