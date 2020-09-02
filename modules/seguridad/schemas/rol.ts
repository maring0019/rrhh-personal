import { Schema, model } from "mongoose";

export const RolSchema = new Schema({
    codename: {
        type: String,
        required: true,
    },
    nombre: {
        type: String,
        required: true,
    },
    descripcion: String,
    permisos: [String],
});

export const Rol = model("Rol", RolSchema, "roles");
