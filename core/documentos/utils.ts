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