import * as express from 'express';
import { Usuario } from '../../../auth/schemas/Usuarios';
import UsuarioController from '../controller/usuario';


const controller = new UsuarioController(Usuario); 

export const Routes = express.Router();

Routes.get('/usuarios', controller.get);
Routes.get('/usuarios/:id', controller.getById);

Routes.post('/usuarios', controller.add);
Routes.put('/usuarios/:id', controller.update);
Routes.delete('/usuarios/:id', controller.delete);
