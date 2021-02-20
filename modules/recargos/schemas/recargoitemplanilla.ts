import { Schema, Types} from 'mongoose';
import { RecargoTurno } from './recargoturno';
import { RecargoJustificacion } from './recargojustificacion';


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
    fecha: Date,
    turno: RecargoTurno,
    justificacion: RecargoJustificacion,
    observaciones: String
})
    