import { Schema, model } from 'mongoose';
import { PeriodoSchema } from './periodo';

const constantes = {
    OPERACION: {
        type: String,
        enum: ['suma',]
    },
    SEXO: {
        type: String,
        enum: ['femenino', 'masculino', 'otro']
    },
    COMPARADOR: {
        type: String,
        enum: ['=', '=>', '>', '<', '<=', '!=']
    }


}
/**
 * Define una formula o control a asociar sobre un articulo, la cual
 * luego se aplicara al agente al momento de cargar sus ausencias.
 * 
 * Por ejemplo dada la siguiente definicion de formula para el articulo
 * '61Ce':
 * 
 *   { operacion : 'suma',
 *     sexo      : 'fememino',
 *     periodo   : 'cuatrimestral', -- el periodo es una referencia
 *     comparador: '<=',
 *     parametro : 10
 *   }
 * Indica que los agentes de sexo *femenino*, sólo pueden justificar 
 * *10* dias de ausentismo por *cuatrimestre* para dicho articulo.
 * 
 */
export const FormulaSchema = new Schema({
    operacion:constantes.OPERACION,       // Este atributo esta de mas segun la logica del sistema anterior. Lo mantenemos por el momento
    parametro: String,                    // Representa un numero de dias
    comparador: constantes.COMPARADOR,    // 
    sexo:constantes.SEXO,                 // Indica segun el sexo del agente si se debe aplicar o no el control/formula definida
    periodo: PeriodoSchema,               // Indica el periodo en el que se debe evaluar la formula
    limiteAusencias: Number,
    fechaDesde: Date,                     // Indica a partir de que fecha aplicar el control
    fechaHasta:Date,                      // Indica hasta cuando aplicar el control
    activa: Boolean                       // Este atributo tiene prioridad sobre las fechas desde y hasta
})

export const Formula = model('Formula', FormulaSchema, 'formulas');