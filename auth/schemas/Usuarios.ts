import { Schema, model, Document } from 'mongoose';

export interface IUsuario {
    usuario: number;
    activo: boolean;
    nombre: string;
    apellido: string;
    password: string;
    foto: string;
    authMethod: string;
    lastLogin: Date;
}

export interface IUsuarioDoc extends IUsuario, Document {}

export const UsuarioSchema = new Schema({
    usuario: {
        type: Number,
        required: true,
        unique: true
    }, 
    activo: Boolean,
    nombre: String,
    apellido: String,
    password: String,
    foto: String,
    authMethod: String,
    lastLogin: Date,
});

export const Usuario = model<IUsuarioDoc>('usuarios', UsuarioSchema, 'usuarios');
