import { Schema, Types} from 'mongoose';
import { RecargoTurnoSchema } from './recargoturno';
import { RecargoJustificacionSchema } from './recargojustificacion';


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
    turno: RecargoTurnoSchema,
    justificacion: RecargoJustificacionSchema,
    observaciones: String
})
    