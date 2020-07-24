import { Schema, model, Document } from 'mongoose';

export interface IUsuario {
    usuario: number;
    activo: boolean;
    nombre: string;
    apellido: string;
    password: string;
    foto: string;
    permisos: string[];
    // servicios: any[];
    extra:any; // En extra vamos a incluir servicios
}

export interface IUsuarioDoc extends IUsuario, Document {}

export const UsuarioSchema = new Schema({
    usuario: Number,
    activo: Boolean,
    nombre: String,
    apellido: String,
    password: String,
    foto: String,
    permisos: [String],
    // servicios: [Schema.Types.Mixed],
    extra:Schema.Types.Mixed
});

export const Usuario = model<IUsuarioDoc>('usuarios', UsuarioSchema, 'usuarios');
