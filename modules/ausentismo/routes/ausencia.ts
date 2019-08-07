import * as express from 'express';
import * as utils from '../commons/utils';

import  * as AusentismoController from '../controller/ausentismo';
import LicenciasController from '../controller/licencias';
import AusenciasController from '../controller/ausencias';

export const Routes = express.Router();

let middleware = async function(req, res, next ){
    const ausentismo = await utils.parseAusentismo(req.body);
    res.locals.ausentismo = ausentismo;
    if (ausentismo.articulo.descuentaDiasLicencia)
    {
        res.locals.controller = new LicenciasController();
    }
    else{
        res.locals.controller = new AusenciasController();
    }
    next()
}

// Routes.post('/ausencias', AusenciaController.addAusencia);
Routes.post('/ausencias/periodo', middleware, AusentismoController.addAusentismo);
Routes.post('/ausencias/periodo/sugerir', middleware, AusentismoController.sugerirDiasAusentismo);
Routes.post('/ausencias/periodo/calcular', AusentismoController.calcularAusentismo);
Routes.put('/ausencias/periodo/:id',middleware, AusentismoController.updateAusentismo);

Routes.get('/ausencias/periodo', AusentismoController.getAusentismo);
Routes.get('/ausencias/periodo/:id', AusentismoController.getAusentismoById);

// Routes.delete('/ausencias/:id', AusenciaController.deleteAusencia);


