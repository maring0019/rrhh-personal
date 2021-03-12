import { Schema, model, Types } from "mongoose";

import { ServicioSchema } from "../../../core/organigrama/schemas/servicio";
import { SectorSchema } from "../../../core/organigrama/schemas/sector";
import { AgrupamientoSchema } from "../../../core/organigrama/schemas/agrupamiento";
import { UbicacionSchema } from "../../../core/organigrama/schemas/ubicacion";

export const CargoSchema = new Schema({
	agrupamiento: AgrupamientoSchema,
	//categoria: CategoriaSchema, // No se utiliza mas. Se reemplaza por agrupamiento
	puesto: {
		_id: {
			type: Types.ObjectId,
			required: true
        },
		nombre:{
			type: String,
			index: true,
			required: true,
		}
	}, // Alias Agrupamiento (otro agrupamiento)
	subpuesto: {
		_id: {
			type: Types.ObjectId,
			required: true
        },
		nombre:{
			type: String,
			index: true,
			required: true,
		}
	}, // Alias Funcion
	sector: SectorSchema, // Alias Lugar de Trabajo
	servicio: ServicioSchema,
	ubicacion: UbicacionSchema,
	observaciones: String,
	esJefe: Boolean,
	jefeUbicaciones: [UbicacionSchema],
});

export const Cargo = model("Cargo", CargoSchema, "cargos");
