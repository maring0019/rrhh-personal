import BaseController from '../../../core/app/basecontroller';
import { UbicacionServicio } from '../schemas/ubicacionservicio';

class UbicacionServicioController extends BaseController {

    /**
     * TODO Implementar correctamente cuando se tenga la info del usuario
     * @param req 
     * @param res 
     * @param next 
     */
    async getByUserId(req, res, next) {
        try {
            let obj = await UbicacionServicio.find({ codigo: { $in: [ 352, 343]}});
            return res.json(obj);
        } catch (err) {
            return next(err);
        }
    }
    /**
     * Unicamente interesan las ubicaciones cuyos codigos 
     * sean 25, 30, 35, 40
     * @param req 
     */
    getQueryParams(req){
        let params = super.getQueryParams(req);
        params.tipo = { $in: [25, 30, 35, 40]};
        return params;
    }
}

export default UbicacionServicioController; 
