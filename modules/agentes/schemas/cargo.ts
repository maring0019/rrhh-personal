import { Schema, model } from 'mongoose';

import { TipoNormaLegalSchema } from '../../../core/tm/schemas/normalegal';
import { CategoriaSchema } from '../../../core/organigrama/schemas/categoria';
import { ServicioSchema } from '../../../core/organigrama/schemas/servicio';
import { SectorSchema } from '../../../core/organigrama/schemas/sector';
import { PuestoSchema } from '../../../core/organigrama/schemas/puesto';
import { SubPuestoSchema } from '../../../core/organigrama/schemas/subpuesto';

export const AGRUPAMIENTO = {
    type: String,
    enum: ['auxiliar', 'operario', 'profesional', 'técnico']
}


/**
 * Historia Laboral del Agente
 */
export const CargoSchema = new Schema({
    tipoNormaLegal: TipoNormaLegalSchema,
    numeroNormaLegal: String,
    fechaNormaLegal: Date,
    agrupamiento: AGRUPAMIENTO, // TODO Es correcto este agrupamiento?
    
    categoria: CategoriaSchema,
    puestoTrabajo: PuestoSchema, // TODO Es el agrupamiento de la pantalla?
    subPuestoTrabajo: SubPuestoSchema, // TODO Es la funcion de la pantalla?
    lugarTrabajo: SectorSchema,
    servicio: ServicioSchema,
    observaciones: String,
    
    // Atributos del Regimen. TODO Analizar si no es conveniente moverlo a otro schema
    // regimenHorario: String, // TODO Implementar SChema
    prolongacionJornada: String,
    actividadCritica: String,
    tiempoPleno: {
        type: Boolean,
        default: false
    },
    dedicacionExclusiva: {
        type: Boolean,
        default: false
    },
    guardiasPasivas: {
        type: Boolean,
        default: false
    },
    guardiasActivas: {
        type: Boolean,
        default: false
    },
    inactivo:{
        type: Boolean,
        default: false
    }
})

export const Cargo = model('Cargo', CargoSchema, 'cargos');