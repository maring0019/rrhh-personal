import * as express from 'express';
import * as utils from '../commons/utils';

import { Types } from 'mongoose';
import { AusenciaPeriodo } from '../schemas/ausenciaPeriodo';

import  * as AusentismoController from '../controller/ausentismo';
import LicenciasController from '../controller/licencias';
import AusenciasController from '../controller/ausencias';


export const Routes = express.Router();


let middleware = async function(req, res, next ){    
    try {
        let ausentismo = await utils.parseAusentismo(req.body);
        let articulo = ausentismo.articulo;
        if (req.params.id){
            if (!Types.ObjectId.isValid(req.params.id)) return res.status(404).send();
           
            let ausentismoToUpdate:any = await AusenciaPeriodo.findById(req.params.id);
            if (!ausentismoToUpdate)return res.status(404).send();
            
            res.locals.ausentismoToUpdate = ausentismoToUpdate;
            articulo = await utils.parseArticulo(ausentismoToUpdate.articulo);
        }
        res.locals.ausentismo = ausentismo;
        res.locals.controller = articulo.descuentaDiasLicencia? new LicenciasController():new AusenciasController();
        next();
    } catch (err) {
        return next(err);
    }
}

// Routes.post('/ausencias', AusenciaController.addAusencia);
Routes.post('/ausencias/periodo', middleware, AusentismoController.addAusentismo);
Routes.post('/ausencias/periodo/sugerir', middleware, AusentismoController.sugerirDiasAusentismo);
Routes.post('/ausencias/periodo/calcular', AusentismoController.calcularAusentismo);
Routes.put('/ausencias/periodo/:id',middleware, AusentismoController.updateAusentismo);

Routes.get('/ausencias/periodo', AusentismoController.getAusentismo);
Routes.get('/ausencias/periodo/:id', AusentismoController.getAusentismoById);

// Routes.delete('/ausencias/:id', AusenciaController.deleteAusencia);


