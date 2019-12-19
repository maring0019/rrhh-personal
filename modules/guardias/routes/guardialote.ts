import * as express from 'express';
import { GuardiaLote } from '../schemas/guardialote';
import GuardiaLoteController from '../controller/guardialote';

const controller = new GuardiaLoteController(GuardiaLote); 
const baseUrl = '/guardiaslotes';

export const Routes = express.Router();

Routes.get(`${baseUrl}`, controller.get);
Routes.get(`${baseUrl}/:id`, controller.getById);
Routes.post(`${baseUrl}`, controller.add);
Routes.put(`${baseUrl}/:id`, controller.update);
Routes.delete(`${baseUrl}/:id`, controller.delete);