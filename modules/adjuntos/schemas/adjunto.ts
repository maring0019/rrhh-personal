import { Schema, Types, model } from 'mongoose';

const audit = require('../../../packages/mongoose-audit-trail');

export const AdjuntoSchema = new Schema({
    object: {
        _id: {
            type: Types.ObjectId,
            required: true,
            index: true
        }
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

AdjuntoSchema.plugin(audit.plugin, { omit: ["_id", "id"] })

export const Adjunto = model('Adjunto', AdjuntoSchema, 'adjuntos');