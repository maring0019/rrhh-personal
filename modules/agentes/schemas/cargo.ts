import { Schema, model } from 'mongoose';

import { TipoNormaLegalSchema } from '../../../core/tm/schemas/normalegal';
import { ServicioSchema } from '../../../core/organigrama/schemas/servicio';
import { SectorSchema } from '../../../core/organigrama/schemas/sector';
import { PuestoSchema } from '../../../core/organigrama/schemas/puesto';
import { SubPuestoSchema } from '../../../core/organigrama/schemas/subpuesto';
import { AgrupamientoSchema } from '../../../core/organigrama/schemas/agrupamiento';


export const CargoSchema = new Schema({
    tipoNormaLegal: TipoNormaLegalSchema,
    numeroNormaLegal: String,
    fechaNormaLegal: Date,
    agrupamiento: AgrupamientoSchema,
    //categoria: CategoriaSchema, // No se utiliza mas. Se reemplaza por agrupamiento
    puesto: PuestoSchema,         // Alias Agrupamiento (otro agrupamiento)
    subpuesto: SubPuestoSchema,   // Alias Funcion
    sector: SectorSchema,         // Alias Lugar de Trabajo
    servicio: ServicioSchema,
    observaciones: String,
})

export const Cargo = model('Cargo', CargoSchema, 'cargos');