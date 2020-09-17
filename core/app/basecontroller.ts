import * as aqp from "api-query-params";
import { Types } from "mongoose";

const diffHistory = require("../../packages/mongoose-audit-trail");
const expandableFields = ["codigo", "nombre", "color"];

class BaseController {
	/**
	 * @param {Model} model The default model object
	 * for the controller. Will be required to create
	 * an instance of the controller
	 */
	private _model: any;

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
		this.getUser = this.getUser.bind(this);
		this.cleanObjectID = this.cleanObjectID.bind(this);
		this.updateField = this.updateField.bind(this);
		this.prepareObjectAudit = this.prepareObjectAudit.bind(this);
	}

	cleanObjectID(obj) {
		obj._id = undefined;
		return obj;
	}

	prepareObjectAudit(objToUpdate, objWithChanges) {
		// Update only changed fields. This way, audit module only audits
		// changed fields correctly
		for (const key of Object.keys(objWithChanges)) {
			let keys = key.split(".");
			this.updateField(objToUpdate, keys, objWithChanges[key]);
		}
		return objToUpdate;
	}

	updateField(obj, keys: string[], value) {
		try {
			if (keys.length == 1) {
				if (keys[0] in obj) obj[keys[0]] = value;
			} else {
				const key = keys.shift();
				if (key in obj) this.updateField(obj[key], keys, value);
			}
		} catch (err) {
			console.log(err);
		}
	}

	async add(req, res, next) {
		try {
			let obj = req.body;
			obj = this.cleanObjectID(obj);
			let object = new this._model(obj);
			const objNuevo = await object.save();
			return res.json(objNuevo);
		} catch (err) {
			return next(err);
		}
	}

	async addMany(req, res, next) {
		try {
			let objects = req.body;
			let newObjects = await this._model.insertMany(objects);
			return res.json(newObjects);
		} catch (err) {
			return next(err);
		}
	}

	async update(req, res, next) {
		try {
			let object: any = await this.getObject(req.params.id);
			if (!object)
				return res
					.status(404)
					.send({ message: this.getMessageNotFound() });
			let changes = req.body;
			// await object.updateOne({ $set: objWithChanges });
			// let objUpdated = await this.getObject(req.params.id);
			object = this.prepareObjectAudit(object, changes);
			await object.updateOne(object);
			let objUpdated = await this.getObject(req.params.id);
			return res.json(objUpdated);
		} catch (err) {
			return next(err);
		}
	}

	async updateMany(req, res, next) {
		try {
			let array = req.body;
			const result = await this._model.bulkWrite(
				array.map((data) => ({
					updateOne: {
						filter: { _id: Types.ObjectId(data._id) },
						update: { $set: data },
					},
				}))
			);
			// TODO Mejorar el manejo y notificacion de errores
			console.log("Vamos a ver los resultados");
			console.log(result);
			return next(200);
		} catch (err) {
			return next(err);
		}
	}

	async delete(req, res, next) {
		try {
			let object: any = await this.getObject(req.params.id);
			if (!object)
				return res
					.status(404)
					.send({ message: this.getMessageNotFound() });
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

	async getHistory(req, res, next) {
		let object: any = await this.getObject(req.params.id);
		if (!object)
			return res.status(404).send({ message: this.getMessageNotFound() });

		diffHistory
			.getHistories(this.getModelName(), object._id, expandableFields)
			.then((histories) => {
				return res.json(histories);
			})
			.catch((err) => {
				return next(err);
			});
	}

	protected async getObject(objectId) {
		if (!objectId || (objectId && !Types.ObjectId.isValid(objectId)))
			return;
		return await this._model.findById(objectId);
	}

	protected getMessageNotFound() {
		return this.messageNotFound ? this.messageNotFound : "Not found";
	}

	protected getModelName() {
		return this.modelName ? this.modelName : this._model.modelName;
	}

	/**
	 * Metodo de ayuda para obtener el usuario del request
	 * si esta presente
	 * @param req
	 */
	protected getUser(req) {
		return req.user ? req.user.usuario : {};
	}

	/**
	 * Override this if necessary
	 */
	protected getQueryParams(req, casters?) {
		let queryParams = aqp(req.query, casters);
		return queryParams;
	}

	/**
	 * Override this if necessary
	 */
	protected getQueryParamsCasters() {
		return {};
	}

	/**
	 * Override this if necessary
	 */
	protected async search(params) {
		let objs = await this._model
			.find(params.filter)
			.sort(params.sort)
			.exec();
		return objs;
	}
}

export default BaseController;
