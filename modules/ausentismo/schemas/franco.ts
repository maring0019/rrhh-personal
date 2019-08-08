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

export const Franco = model('Franco', FrancoSchema, 'francos');