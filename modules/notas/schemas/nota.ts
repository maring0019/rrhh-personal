import { Schema, Types, model } from 'mongoose';

export const NotaSchema = new Schema({
    agente: {
        _id: {
            type: Types.ObjectId,
            required: true,
            index: true
        },
        nombre: String,
        apellido: String
    },
    usuario: Schema.Types.Mixed,
    titulo: String ,
    detalle: String
    },
    {
        timestamps: { currentTime: () => timestamp() }
    }
)

function timestamp(){
    const f = new Date();
    return new Date(Date.UTC(f.getFullYear(),f.getMonth(),f.getDate(),f.getHours(),f.getMinutes()));
}

export const Nota = model('Nota', NotaSchema, 'notas');