import { Schema, model } from "mongoose";

import { ServicioSchema } from "../../../core/organigrama/schemas/servicio";
import { SectorSchema } from "../../../core/organigrama/schemas/sector";
import { PuestoSchema } from "../../../core/organigrama/schemas/puesto";
import { SubPuestoSchema } from "../../../core/organigrama/schemas/subpuesto";
import { AgrupamientoSchema } from "../../../core/organigrama/schemas/agrupamiento";
import { UbicacionSchema } from "../../../core/organigrama/schemas/ubicacion";

export const CargoSchema = new Schema({
	agrupamiento: AgrupamientoSchema,
	//categoria: CategoriaSchema, // No se utiliza mas. Se reemplaza por agrupamiento
	puesto: PuestoSchema, // Alias Agrupamiento (otro agrupamiento)
	subpuesto: SubPuestoSchema, // Alias Funcion
	sector: SectorSchema, // Alias Lugar de Trabajo
	servicio: ServicioSchema,
	ubicacion: UbicacionSchema,
	observaciones: String,
	esJefe: Boolean,
	jefeUbicaciones: [UbicacionSchema],
});

export const Cargo = model("Cargo", CargoSchema, "cargos");
