import BaseController from "../../../core/app/basecontroller";

class GuardiaPeriodoController extends BaseController {
    
    protected getQueryParams(req, casters?) {
        let queryParams = super.getQueryParams(req, casters);
        // Add default order
        queryParams['sort'] = { fechaHasta: -1 }
        return queryParams;
	}
}

export default GuardiaPeriodoController; 
