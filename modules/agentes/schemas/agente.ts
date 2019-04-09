import { Schema, model } from 'mongoose';

import { constantes } from '../../../core/constants/index';
import { DireccionSchema } from '../../../core/tm/schemas/direccion';
import { PaisSchema } from '../../../core/tm/schemas/pais';
import { ContactoSchema } from '../../../core/tm/schemas/contacto';
import { EducacionSchema } from '../../../core/tm/schemas/educacion';
import { EspecialidadSchema } from '../../../core/tm/schemas/especialidad';
// import { SituacionEnPlantaSchema } from './situacionEnPlanta';
import { CargoSchema } from '../../../core/tm/schemas/cargo';


export const AgenteSchema = new Schema({
    numero: String, // En el alta aun no esta disponible este dato
    tipoDocumento: String, // No deberia utilizarse mas. Solo DU
    documento: {
        type: String,
        required: true,
        es_indexed: true
    },
    cuil: {
        type: String,
        required: false, // No todos los agentes tienen CUIL en SQLServer
        es_indexed: true
    },
    nombre: {
        type: String,
        required: true,
        es_indexed: true
    },
    apellido: {
        type: String,
        required: true,
        es_indexed: true
    },
    estadoCivil: constantes.ESTADOCIVIL,
    sexo: constantes.SEXO,
    genero: constantes.SEXO,
    fechaNacimiento: {
        type: Date,
        es_indexed: true
    },
    nacionalidad: PaisSchema,
    direccion: [DireccionSchema],
    contacto: [ContactoSchema],
    educacion: [EducacionSchema],
    especialidad: EspecialidadSchema, // TODO Ver especialidadSchema
    // situacion: SituacionEnPlantaSchema,
    cargos: [CargoSchema],
    foto: String,
    codigoFichado: String,
    activo: Boolean
});

export const Agente = model('Agente', AgenteSchema, 'agentes');