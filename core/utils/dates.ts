import { format } from 'util';

export function parseDate(date){
    return date;
}


export function addOneDay(fecha){
    let tomorrow = new Date(fecha);
    return new Date(tomorrow.setDate(tomorrow.getDate() + 1));
}

export function esFinDeSemana(date){
    return  (date.getDay() == 6 || date.getDay() == 0);
}

export function isSameDay(d1, d2){
    const f1:Date = this.parseDate(d1);
    const f2:Date = this.parseDate(d2);
    return f1.getTime() == f2.getTime();
}


export function getFormattedDate(date) {
    const month = format(date.getMonth() + 1);
    const day = format(date.getDate());
    const year = format(date.getFullYear());
    return  day + "/" + month + "/" + year;
}
