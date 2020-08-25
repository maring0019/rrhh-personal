import { Schema, model, Document } from 'mongoose';

export interface IUsuario {
    usuario: string;
    activo: boolean;
    nombre: string;
    apellido: string;
    password: string;
    foto: string;
    authMethod: string;
    permisos: [String];
    lastLogin: Date;
}

export interface IUsuarioDoc extends IUsuario, Document {}

export const UsuarioSchema = new Schema({
    usuario: {
        type: String,
        required: true,
        unique: true
    }, 
    activo: Boolean,
    nombre: String,
    apellido: String,
    password: String,
    foto: String,
    authMethod: String,
    permisos: [String],
    lastLogin: Date,
});

export const Usuario = model<IUsuarioDoc>('usuarios', UsuarioSchema, 'usuarios');
