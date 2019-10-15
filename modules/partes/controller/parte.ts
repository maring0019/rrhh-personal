import BaseController from '../../../core/app/basecontroller';

class ParteController extends BaseController {

    async get(req, res, next) {
        console.log('Estamos buscando!!!');
        return super.get(req, res, next);
        // try {
        //     const params = this.getQueryParams(req);
        //     let objs = await this._model
        //         .find(params.filter)
        //         .sort(params.sort)
        //         .exec();
        //     return res.json(objs);
        // } catch (err) {
        //     return next(err);
        // }
    }

    getQueryParams(req){
        let queryParams = super.getQueryParams(req);
        if (queryParams.filter && queryParams.filter.fecha){
            // Ajustamos el filtro fecha para considerar solo 
            // el dia, descartando horas y minutos
            const fecha = queryParams.filter.fecha;
            let fechaSinHora = this.parseOnlyDate(fecha)
            let tomorrow = this.parseOnlyDate(this.addOneDay(fecha)); 
            delete queryParams.filter['fecha'];
            queryParams.filter.$and = [
                {"fecha": {$gte: fechaSinHora}},
                {"fecha": {$lt: tomorrow}}
                ];
        }
        console.log(queryParams);
        return queryParams;
    }

    addOneDay(fecha){
        let tomorrow = new Date(fecha);
        return new Date(tomorrow.setDate(tomorrow.getDate() + 1));
    }

    parseOnlyDate(date){
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
}

export default ParteController; 
