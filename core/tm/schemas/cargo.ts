import { Schema } from 'mongoose';

import { NormaLegalSchema } from './normaLegal';
import { CategoriaSchema } from './categoria';
import { ServicioSchema } from './servicio';
import { SectorSchema } from './sector';


export const AGRUPAMIENTO = {
    type: String,
    enum: ['auxiliar', 'operario', 'profesional', 'técnico']
}

export const CargoSchema = new Schema({
    tipoNormaLegal: NormaLegalSchema,
    numeroNormaLegal: Number,
    fechaNormaLegal: Date,
    categoria: CategoriaSchema,
    agrupamiento: AGRUPAMIENTO,
    funcion: String, // [TODO] Fixme
    lugarTrabajo: SectorSchema,
    servicio: ServicioSchema,
    observaciones: String
})