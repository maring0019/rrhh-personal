import { Schema, model, Types } from 'mongoose';

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
    vigencia: Number,          // TODO Anio de vigencia o Fecha desde y hasta??
    periodo: String,           // Anual, Cuatrimestre, Bimestre, etc. Puede ser null
    intervalos:[               // Ej.Period Anual=1 intervalo, Periodo Cuatrimestre=3 intervalos, etc
        {
            desde: Date,       // Si el periodo es null este atributo no se requiere
            hasta: Date,
            totales: Number,
            ejecutadas: Number,
            disponibles: Number,
            asignadas: Number, // Volatile. Atributo temporal utilizado al momento del calculo de dias
                               // de ausencia que se asignaran. No se persiste este atributo
        }
    ],
    vencido: Boolean
        
    
})

export const IndicadorAusentismo = model('IndicadorAusentismo', IndicadorAusentismoSchema, 'indicadoresAusentismo');