import { Schema, model, Document } from "mongoose";

const audit = require("../../packages/mongoose-audit-trail");

export interface IUsuario {
	usuario: string;
	activo: boolean;
	nombre: string;
	apellido: string;
	password: string;
	foto: string;
	authMethod: string;
	permisos: [String];
	roles: [String];
	lastLogin: Date;
}

export interface IUsuarioDoc extends IUsuario, Document {}

export const UsuarioSchema = new Schema({
	usuario: {
		type: String,
		required: true,
		unique: true,
	},
	activo: Boolean,
	nombre: String,
	apellido: String,
	password: String,
	foto: String,
	authMethod: String,
	permisos: [String],
	roles: [String],
	lastLogin: Date,
});

UsuarioSchema.plugin(audit.plugin, { omit: ["_id", "id"] });

export const Usuario = model<IUsuarioDoc>(
	"usuarios",
	UsuarioSchema,
	"usuarios"
);
