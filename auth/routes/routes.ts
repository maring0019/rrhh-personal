import * as express from 'express';
import { Auth } from '../index';
import { authenticateSession } from '../middleware';
import { Usuario } from '../schemas/Usuarios';
import * as LdapController from '../ldap.controller';
import * as AuthController from '../auth.controller';

const sha1Hash = require('sha1');

export const Routes = express.Router();

/**
 * Obtiene el user de la session
 * @get /api/auth/sesion
 */

Routes.get('/sesion', authenticateSession(), (req, res) => {
    res.json((req as any).user);
});


/**
 * Refresca el token y los permisos dado una organizacion}
 * @param {string} usuario nombre de usuario (DNI)
 * @param {string} password Password de la cuenta
 * @post /api/auth/login
 */

Routes.post('/login', async (req, res, next) => {
    // Función interna que genera token
    const login = async (user, prof?) => {
        AuthController.updateUser(user.usuario, user.nombre, user.apellido, user.password);
        res.json({
            token: Auth.generateUserToken(user)
        });

    };
    
    // Valida datos
    if (!req.body.usuario || !req.body.password) {
        return next(403);
    }
    try {
        const user = await AuthController.findUser(req.body.usuario);
        if (user) {
            switch (user.authMethod || 'ldap') {
                case 'ldap':
                    const ldapUser = await LdapController.checkPassword(user, req.body.password);
                    if (ldapUser) {
                        user.nombre = ldapUser.nombre;
                        user.apellido = ldapUser.apellido;
                        user.password = sha1Hash(req.body.password);
                        return login(user);
                    } else {
                        return next(403);
                    }
                case 'password':
                case '':
                case undefined:
                case null:
                    const passwordSha1 = sha1Hash(req.body.password);
                    if (passwordSha1 === user.password) {
                        return login(user);
                    }
                    break;
            }
        }
        return next(403);
    } catch (error) {
        return next(403);
    }
});

Routes.post('/usuarios', async (req, res, next) => {
    let usuario = new Usuario(
        { usuario: req.body.usuario,
            activo: true,
            nombre: req.body.usuario,
            apellido: 'Testing',
            password: sha1Hash(req.body.password)
        }
    );
    usuario.save();
    return next(200);
});
