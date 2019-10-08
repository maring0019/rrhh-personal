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
}

export default ParteController; 
