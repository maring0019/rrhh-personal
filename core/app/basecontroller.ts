// import { Types } from "mongoose";
import * as aqp from 'api-query-params';
import { Types } from 'mongoose';

class BaseController {
    /**
     * @param {Model} model The default model object
     * for the controller. Will be required to create
     * an instance of the controller
     */
    private _model:any;

    constructor(model) {
       this._model = model;
       this.add = this.add.bind(this);
       this.update = this.update.bind(this);
       this.delete = this.delete.bind(this);
       this.get = this.get.bind(this);
       this.getById = this.getById.bind(this);
    }


    async add(req, res, next) {
        try {
            let obj = req.body;
            let object = new this._model(obj);
            const objNuevo = await object.save();
            return res.json(objNuevo);
        } catch (err) {
            return next(err);
        }
    }

    async update(req, res, next) {
        try {
            const id = req.params.id;
            if (!id || (id && !Types.ObjectId.isValid(id))) return res.status(404).send();
            let object:any = await this._model.findById(id);
            if (!object) return res.status(404).send();
            let objToUpdate = req.body;
            objToUpdate = {...objToUpdate, ...object}; // Merge properties
            const objectUpdated = await objToUpdate.save();
            return res.json(objectUpdated);
        } catch (err) {
            return next(err);
        }
    }

    async delete(req, res, next) {
        try {
            const id = req.params.id;
            if (!id || (id && !Types.ObjectId.isValid(id))) return res.status(404).send();
            let object:any = await this._model.findById(id);
            if (!object) return res.status(404).send("Not found");
            const objRemoved = await object.remove();
            return res.json(objRemoved);
        } catch (err) {
            return next(err);
        }
    }

    async get(req, res, next) {
        try {
            const params = this.getQueryParams(req);
            let objs = await this._model
                .find(params.filter)
                .sort(params.sort)
                .exec();
            return res.json(objs);
        } catch (err) {
            return next(err);
        }
    }

    async getById(req, res, next) {
        try {
            let obj = await this._model.findById(req.params.id);
            return res.json(obj);
        } catch (err) {
            return next(err);
        }
    }

    protected getQueryParams(req){
        let queryParams = aqp(req.query);
        // aqp(req.query, {
        //     casters: {
        //         id: val => Types.ObjectId(val),
        //     },
        //     castParams: {
        //         // '_id': 'id',
        //         'id': 'id'
        //     }
        // })
        return queryParams;
    }
 
    /**
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {function} next The callback to the next program handler
     * @return {Object} res The response object
     */
    // create(req, res, next) {
    //    let obj = req.body;
    //    const validator = this._model.validateCreate(obj);
    //    if (validator.passes()) {
    //       let object = new this._model(obj);
    //       object.save()
    //          .then((savedObject) => {
    //             const meta = getSuccessMeta();
    //             return res.status(OK).json(formatResponse(meta, savedObject));
    //          }, (err) => {
    //             return next(err);
    //          });
    //    } else {
    //       const appError = new AppError('input errors',
    //          BAD_REQUEST, validator.errors.all());
    //       return next(appError);
    //    }
    // }
 }
 
 export default BaseController;