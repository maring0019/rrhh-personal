import { Schema, model, Types } from 'mongoose';

export const IndicadorPeriodoSchema = new Schema({
    periodo: String,       // Anual, Cuatrimestre, Bimestre
    intervalos:[               // Ej. Anual=1 intervalo, Cuatrimestre=3 intervalos, etc
        {
            desde: Date,
            hasta: Date,
            totales: Number,
            ejecutadas: Number,
            disponibles: Number,
            asignadas: Number, // Volatile
        }
    ]
})

export const IndicadorAusentismoSchema = new Schema({
    agente: {
        id: {
            type: Types.ObjectId,
            required: true
        }
    }, 
    articulo: {
        id: {
            type: Types.ObjectId,
            required: true
        },
        codigo: {
            type: String,
            required: true
        }
    },
    vigencia: Number, // Anio de vigencia
    indicadores: [
        {
            periodo: String,           // Anual, Cuatrimestre, Bimestre
            intervalos:[               // Ej. Anual=1 intervalo, Cuatrimestre=3 intervalos, etc
                {
                    desde: Date,
                    hasta: Date,
                    totales: Number,
                    ejecutadas: Number,
                    disponibles: Number,
                    asignadas: Number, // Volatile
                }
            ]
        }
    ]
})

export const IndicadorAusentismo = model('IndicadorAusentismo', IndicadorAusentismoSchema, 'indicadoresAusentismo');