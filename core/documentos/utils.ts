export function title(value: any, arg1?: string): any {
    if(!value){
        return '---';
    }
    else{
        if (typeof value === 'string' || typeof value === 'number'){
            return titleCase(''+value);
        }
        else{
            if (arg1 && arg1 in value){
                return title(value[arg1]);
            }
            else{
                return titleCase(''+value);
            }
        }
    }
}

export function titleCase(str) {
    const title =str.toLowerCase().split(' ').map(function (word) {
        return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
    return title;
}


export function getQueryParam(filter, filterCondition ){
    let filterField;
    if (filter && filter[filterCondition]){
        filterField = filter[filterCondition];
    }
    return filterField;
}

export function cleanFilters(filter){
    let blacklist = ['$group', 'fechaDesde', 'fechaHasta', 'articulos', 'anios'];
    Object.keys(filter).forEach(field => {
        if (blacklist.indexOf(field)>=0) delete filter[field];        
    });
    return filter;
}

export function projectionToArray(extraFields){
    let output = [];
    Object.keys(extraFields).forEach(field => {
        output.push(field);
    });
    return output;
}