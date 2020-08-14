import { format } from 'util';

export function getDate(date:Date):Date{
    // return date.setHours(0,0,0,0)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

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





export function equal(d1, d2){
    const f1:Date = this.parseDate(d1);
    const f2:Date = this.parseDate(d2);
    return f1.getTime() == f2.getTime();
}

export function dateOnly(date){
    try {
        new Date(date);
        return new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate(),0, 0, 0));
    }
    catch{
        return null;
    }
    
}

export function isSameDay(d1:Date, d2:Date){
    const f1 = new Date(Date.UTC(d1.getUTCFullYear(),d1.getUTCMonth(),d1.getUTCDate()));
    const f2 = new Date(Date.UTC(d2.getUTCFullYear(),d2.getUTCMonth(),d2.getUTCDate())); 
    return f1.getTime() == f2.getTime();
}

export function isDateEqual(d1:Date, d2:Date){
    const f1 = new Date(Date.UTC(d1.getUTCFullYear(),d1.getUTCMonth(),d1.getUTCDate()));
    const f2 = new Date(Date.UTC(d2.getUTCFullYear(),d2.getUTCMonth(),d2.getUTCDate())); 
    return f1.getTime() == f2.getTime();
}

export function isDateBefore(d1, d2){
    const f1 = new Date(Date.UTC(d1.getUTCFullYear(),d1.getUTCMonth(),d1.getUTCDate()));
    const f2 = new Date(Date.UTC(d2.getUTCFullYear(),d2.getUTCMonth(),d2.getUTCDate())); 
    return f1.getTime() < f2.getTime();
}


export function getFormattedDate(date) {
    const month = format(date.getMonth() + 1);
    const day = format(date.getDate());
    const year = format(date.getFullYear());
    return  day + "/" + month + "/" + year;
}
