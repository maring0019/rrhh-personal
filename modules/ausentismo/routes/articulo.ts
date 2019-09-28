// import * as express from 'express';
// import * as ArticuloController from '../controller/articulo';


// export const Routes = express.Router();


// Routes.get('/articulos', ArticuloController.getArticulos);
// Routes.get('/articulos/:id', ArticuloController.getArticuloById);

// Routes.post('/articulos', ArticuloController.addArticulo);
// Routes.put('/articulos/:id', ArticuloController.updateArticulo);
// Routes.delete('/articulos/:id', ArticuloController.deleteArticulo);


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
