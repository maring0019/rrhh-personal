import BaseController from '../../../core/app/basecontroller';

class UbicacionServicioController extends BaseController {

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
