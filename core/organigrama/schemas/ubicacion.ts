import { Schema, model } from "mongoose";

export const UbicacionSchema = new Schema({
	padre: {
		type: Number, // Self reference to codigo field
		index: true,
	},
	codigo: {
		type: Number,
		index: true,
		required: true,
	},
	nombre: {
		type: String,
		index: true,
		required: true,
	},
	nombreCorto: String,
	interno: Boolean,
	tipo: {
		type: Number,
		index: true,
		required: true,
	},
	subtipo: Number,
	telefono: String,
	despachoHabilitado: Boolean,
	ancestors: [Number], // Para simplificar las consultas. See https://docs.mongodb.com/manual/tutorial/model-tree-structures-with-ancestors-array/
});

export const Ubicacion = model("Ubicacion", UbicacionSchema, "ubicaciones");
