import { Schema, model } from "mongoose";
const audit = require("../../../packages/mongoose-audit-trail");

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

RolSchema.plugin(audit.plugin, { omit: ["_id"] });

export const Rol = model("Rol", RolSchema, "roles");
