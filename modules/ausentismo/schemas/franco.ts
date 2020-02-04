import { Schema, Types, model } from 'mongoose';

export const FrancoSchema = new Schema({
    agente: 
        {
            _id: {
                type: Types.ObjectId,
                required: true
            }
        }, 
    fecha:{
        type: Date,
        required: true
    } 
})

// FrancoSchema.index({ 'agente._id': 1, fecha: 1}, {unique: true});

export const Franco = model('Franco', FrancoSchema, 'francos');