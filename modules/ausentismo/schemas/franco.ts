import { Schema, Types, model } from 'mongoose';

export const FrancoSchema = new Schema({
    agente: 
        {
            id: {
                type: Types.ObjectId,
                required: true
            }
        }, 
    fecha:{
        type: Date,
        required: true
    } 
})

// FrancoSchema.index({ 'agente.id': 1, fecha: 1}, {unique: true});

export const Franco = model('Franco', FrancoSchema, 'francos');