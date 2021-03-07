import BaseController from '../../../core/app/basecontroller';
import { IndicadorLicencia } from '../schemas/indicadorlicencia';
import { Articulo } from '../schemas/articulo';
import { Types } from 'mongoose';


class IndicadorLicenciaController extends BaseController {
    
    async add(req, res, next){
        try {
            const agente = req.body.agente;
            let artLicencia = req.body.articulo;
            if (!agente)
                return res.status(400).send({ message:"Debe indicar un agente"});

            if (!artLicencia)
                artLicencia = await Articulo.findOne({codigo:"53"});  
            
            let indicadorSimilar =  await IndicadorLicencia.find(
                { "agente._id": agente._id, "articulo._id": artLicencia._id, "vigencia": req.body.vigencia });

            if (indicadorSimilar.length > 0 )
                return res.status(400).send({ message:"Ya existe otro registro con el mismo periodo."});
            
            const obj = new IndicadorLicencia({
                agente: agente,
                articulo: artLicencia,
                vigencia: req.body.vigencia,
                totales: req.body.totales,
                ejecutadas: req.body.ejecutadas,
                vencido: req.body.vencido,
            });
            const objNuevo = await obj.save();
            return res.json(objNuevo);
        } catch (err) {
            return next(err);
        }
    }

    async update(req, res, next){
        try {
            const id = req.params.id;
            if (!id || (id && !Types.ObjectId.isValid(id))) return res.status(404).send({ message:"Not found"});
            
            let objToUpdate:any = await IndicadorLicencia.findById(id);
            if (!objToUpdate) return res.status(404).send({ message:"Not found"});

            if (req.body.vigencia != objToUpdate.vigencia){
                const indicadorSimilar =  await IndicadorLicencia.find(
                    { "agente._id": objToUpdate.agente._id, "articulo._id": objToUpdate.articulo._id, "vigencia": req.body.vigencia });

                if (indicadorSimilar.length > 0 ) return res.status(400).send({ message:"Ya existe otro registro con el mismo periodo."});
            }            
            let changes = req.body;
			objToUpdate = this.prepareObjectAudit(objToUpdate, changes);
			await objToUpdate.updateOne(objToUpdate);
			let objUpdated = await this.getObject(req.params.id);
            return res.json(objUpdated);
        } catch (err) {
            return next(err);
        }
    }

}

export default IndicadorLicenciaController;