import { Schema, model } from 'mongoose';

const constantes = {
    UNIDADTIEMPO: {
        type: String,
        enum: ['hora', 'dia', 'semana', 'mes', 'anual']
    },
}


export const PeriodoSchema = new Schema({
    nombre:String,
    unidadTiempo: constantes.UNIDADTIEMPO,
    valor:Number
})

export const Periodo = model('Periodo', PeriodoSchema, 'periodos');