import { Schema, model } from 'mongoose';

import { constantes } from '../../../core/constants/index';
import { DireccionSchema } from '../../../core/tm/schemas/direccion';
import { PaisSchema } from '../../../core/tm/schemas/pais';
import { ContactoSchema } from '../../../core/tm/schemas/contacto';
import { EducacionSchema } from '../../../core/tm/schemas/educacion';
import { EspecialidadSchema } from '../../../core/tm/schemas/especialidad';
import { SituacionLaboralSchema } from './situacionlaboral';


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
    genero: constantes.GENERO,
    fechaNacimiento: {
        type: Date,
        es_indexed: true
    },
    nacionalidad: PaisSchema,
    direccion: DireccionSchema,
    contactos: [ContactoSchema],
    educacion: [EducacionSchema],
    especialidad: EspecialidadSchema, // TODO Ver especialidadSchema

    foto: String, // Encode64
    codigoFichado: String,
    activo: Boolean,
    historiaLaboral: [SituacionLaboralSchema],
    // TODO: Analizar si traer estos datos aqui desde SchemaSituacion
    situacionFechaIngresoEstado: Date,
    situacionFechaIngresoHospital: Date,
    antiguedadVacaciones: Date,
    antiguedadPago: Date
});

AgenteSchema.methods.nombreCompleto = function(cb) {
    const apellido = this.apellido || '';
    const nombre = this.nombre || '';
    return `${apellido}, ${nombre}`
  };

/**
 * Indice para la busquedas de texto libre en los campos definidos
 */
AgenteSchema.index({
    documento: 'text',
    cuil: 'text',
    nombre: 'text',
    apellido: 'text'
  }, {
    weights: {
      cuil: 5,
      documento: 4,
      nombre: 3,
      apellido: 2
    },
  });

export const Agente = model('Agente', AgenteSchema, 'agentes');