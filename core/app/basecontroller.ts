import * as aqp from 'api-query-params';
import { Types } from 'mongoose';

const diffHistory = require("../../packages/mongoose-audit-trail");
const expandableFields = ["codigo", "nombre", "color"];

class BaseController {
    /**
     * @param {Model} model The default model object
     * for the controller. Will be required to create
     * an instance of the controller
     */
    private _model:any;
    
    protected messageNotFound = "";
    protected modelName = "";

    constructor(modelClass) {
       this._model = modelClass;
       this.add = this.add.bind(this);
       this.addMany = this.addMany.bind(this);
       this.update = this.update.bind(this);
       this.updateMany = this.updateMany.bind(this);
       this.delete = this.delete.bind(this);
       this.get = this.get.bind(this);
       this.getById = this.getById.bind(this);
       this.getHistory = this.getHistory.bind(this);
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

    async addMany(req, res, next){
        try {
            let objects = req.body;
            let newObjects = await this._model.insertMany(objects)
            return res.json(newObjects);
        } catch (err) {
            return next(err);
        }
    }

    async update(req, res, next) {
        try {
            let object:any = await this.getObject(req.params.id);
            if (!object) return res.status(404).send({ message: this.getMessageNotFound()});
            let objWithChanges = req.body;
            await object.updateOne({ $set: objWithChanges });
            return res.json(object);
        } catch (err) {
            return next(err);
        }
    }

    async updateMany(req, res, next){
        try {
            let array = req.body;
            const result = await this._model.bulkWrite(
                array.map((data) => 
                      ({ updateOne: {
                            filter: { _id: Types.ObjectId(data._id)},
                            update: { $set: data }
                        }
                    })
                )
            )
            // TODO Mejorar el manejo y notificacion de errores
            console.log('Vamos a ver los resultados')
            console.log(result);
            return next(200);
        } catch (err) {
            return next(err);
        }
    }

    async delete(req, res, next) {
        try {
            let object:any = await this.getObject(req.params.id);
            if (!object) return res.status(404).send({ message: this.getMessageNotFound()});
            const objRemoved = await object.remove();
            return res.json(objRemoved);
        } catch (err) {
            return next(err);
        }
    }

    async get(req, res, next) {
        try {
            const casters = this.getQueryParamsCasters();
            const params = this.getQueryParams(req, casters);
            let objs = await this.search(params);
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

    async getHistory(req, res, next){
        let object:any = await this.getObject(req.params.id);
        if (!object) return res.status(404).send({ message: this.getMessageNotFound()});

        diffHistory
            .getHistories(this.getModelName(), object._id, expandableFields)
            .then(histories => {
                return res.json(histories)
            })
            .catch(err => {return next(err)});
    }

    protected async getObject(objectId){
        if (!objectId || (objectId && !Types.ObjectId.isValid(objectId))) return;
        return await this._model.findById(objectId);
    }

    protected getMessageNotFound(){
        return this.messageNotFound? this.messageNotFound : "Not found";
    }

    protected getModelName(){
        return this.modelName? this.modelName : this._model.modelName;
    }

    /**
     * Override this if necessary
     */
    protected getQueryParams(req, casters?){
        let queryParams = aqp(req.query, casters);
        return queryParams;
    }


    /**
     * Override this if necessary
     */
    protected getQueryParamsCasters(){
        return {};
    }

    /**
     * Override this if necessary
     */
    protected async search(params){
        let objs = await this._model
            .find(params.filter)
            .sort(params.sort)
            .exec();
        return objs;
    }

 }
 
 export default BaseController;