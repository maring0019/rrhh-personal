import { Schema, model } from 'mongoose';

export const GuardiaPeriodoSchema = new Schema({
    fechaDesde: Date,
    fechaHasta: Date,
    nombre: String
})

GuardiaPeriodoSchema.methods.range = function(cb) {
    let _fechaDesde = new Date(this.fechaDesde);
    let range = [];
    if (_fechaDesde && this.fechaHasta){
        while (_fechaDesde.getTime() <= this.fechaHasta.getTime()) {
            const tomorrow = addOneDay(_fechaDesde);
            if ( tomorrow.getMonth() != _fechaDesde.getMonth()){
                let dayNumber = _fechaDesde.getDate();
                while (dayNumber < 31){
                    range.push(null);
                    dayNumber +=1;
                }
            }
            range.push(_fechaDesde);
            _fechaDesde = tomorrow;
        }
    }
    return range;  };

function addOneDay(date:Date){
    let tomorrow = new Date(date);
    return new Date(tomorrow.setDate(tomorrow.getDate() + 1 ));
}

export const GuardiaPeriodo = model('GuardiaPeriodo', GuardiaPeriodoSchema, 'guardiaperiodos');