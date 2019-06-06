import * as express from 'express';
import * as ArticuloController from '../controller/articulo';


export const Routes = express.Router();


Routes.get('/articulos', ArticuloController.getArticulos);
Routes.get('/articulos/:id', ArticuloController.getArticuloById);

Routes.post('/articulos', ArticuloController.addArticulo);
// Routes.put('/articulos/:id', ArticuloController.updateArticulo);
// Routes.delete('/articulos/:id', ArticuloController.deleteArticulo);

