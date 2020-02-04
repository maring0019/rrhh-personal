import * as express from 'express';
import { Articulo } from '../schemas/articulo';
import ArticuloController from '../controller/articulo';


const controller = new ArticuloController(Articulo); 

export const Routes = express.Router();

Routes.get('/articulos', controller.get);
Routes.get('/articulos/:id', controller.getById);

Routes.post('/articulos', controller.add);
Routes.put('/articulos/:id', controller.update);
Routes.delete('/articulos/:id', controller.delete);
