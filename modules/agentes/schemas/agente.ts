import { Schema, model } from 'mongoose';
const audit = require('../../../packages/mongoose-audit-trail');

import { parseDate } from '../../../core/utils/dates';
import { constantes } from '../../../core/constants/index';
import { DireccionSchema } from '../../../core/tm/schemas/direccion';
import { ContactoSchema } from '../../../core/tm/schemas/contacto';
import { EducacionSchema } from '../../../core/tm/schemas/educacion';
import { EspecialidadSchema } from '../../../core/tm/schemas/especialidad';
import { SituacionLaboralSchema } from './situacionlaboral';
import { HistoriaLaboralSchema } from './historialaboral';
import { _PaisSchema } from '../../../core/tm/schemas/pais';


export const AgenteSchema = new Schema({
    idLegacy: Number, // ID Sistema anterior.
    numero: String, // En el alta aun no esta disponible este dato
    tipoDocumento: String, // No deberia utilizarse mas. Solo DU
    documento: {
        type: String,
        required: true,
        es_indexed: true,
    },
    foto: String, // Encode64
    cuil: {
        type: String,
        required: false, // No todos los agentes tienen CUIL en SQLServer
        es_indexed: true,
    },
    nombre: {
        type: String,
        required: true,
        es_indexed: true,
    },
    apellido: {
        type: String,
        required: true,
        es_indexed: true,
    },
    estadoCivil: constantes.ESTADOCIVIL,
    sexo: constantes.SEXO,
    genero: constantes.GENERO,
    fechaNacimiento: {
        type: Date,
        set: parseDate,
        get: parseDate,
        es_indexed: true,
    },
    nacionalidad: {
        type: _PaisSchema
    },
    direccion: DireccionSchema,
    contactos: [ContactoSchema],
    educacion: [EducacionSchema],
    especialidad: EspecialidadSchema, // TODO Ver especialidadSchema
    situacionLaboral: SituacionLaboralSchema,
    historiaLaboral: [HistoriaLaboralSchema],
    activo: Boolean,
    codigoFichado: Number,
});

AgenteSchema.methods.nombreCompleto = function (cb) {
    const apellido = this.apellido || '';
    const nombre = this.nombre || '';
    return `${apellido}, ${nombre}`;
};

AgenteSchema.methods.servicios = function (cb) {
    if (this.activo && this.situacionLaboral && this.situacionLaboral.cargo && this.situacionLaboral.cargo.jefeUbicaciones &&
        this.situacionLaboral.cargo.jefeUbicaciones.length) {
        return this.situacionLaboral.cargo.jefeUbicaciones;
    } else {
        return [{codigo:-99}];
    }
};

/**
 * Indice para la busquedas de texto libre en los campos definidos
 */
AgenteSchema.index(
    {
        documento: 'text',
        cuil: 'text',
        nombre: 'text',
        apellido: 'text',
        numero: 'text',
    },
    {
        weights: {
            numero: 6,
            cuil: 5,
            documento: 4,
            nombre: 3,
            apellido: 2,
        },
    }
);

AgenteSchema.plugin(audit.plugin, { omit: ['_id'] });

export const Agente = model('Agente', AgenteSchema, 'agentes');
