import * as express from 'express';
import { ParteEstado } from '../schemas/parteestado';
import ParteEstadoController from '../controller/parteestado';


const controller = new ParteEstadoController(ParteEstado); 

export const Routes = express.Router();

Routes.get('/parteestados', controller.get);
Routes.get('/parteestados/:id', controller.getById);

Routes.post('/parteestados', controller.add);
Routes.put('/parteestados/:id', controller.update);
Routes.delete('/parteestados/:id', controller.delete);
