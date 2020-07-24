import * as express from 'express';
import * as ldapjs from 'ldapjs';
import { Auth } from '../index';
import { authenticateSession } from '../middleware';
import { Usuario } from '../schemas/Usuarios';

import config from '../../confg';

const isReachable = require('is-reachable');
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
    const login = async (nombre: string, apellido: string) => {
        // const ps: any[] = [
        //     Usuario.findOne({ usuario: req.body.usuario }),
        //     Usuario.findOneAndUpdate(
        //         { usuario: req.body.usuario },
        //         { password: sha1Hash(req.body.password), nombre, apellido },
        //     )
        // ];
        // const [user] = await Promise.all(ps);

        // if (!user || user.length === 0) {
        //     return next(403);
        // }

        // Crea el token con los datos de sesión
        const user:any = new Usuario( { usuario: 28588178,
            activo: true,
            nombre: 'David',
            apellido: 'Nievas'
        });
        res.json({
            token: Auth.generateUserToken(user)
        });

    };

    const loginCache = async () => {
        const password = sha1Hash(req.body.password);
        const user = await Usuario.findOne({ usuario: req.body.usuario, password });
        if (!user) {
            // Para testing. Crea un usuario con el nombre de
            // usuario y password especificados.
            // let usuario = new Usuario(
            //     { usuario: req.body.usuario,
            //         activo: true,
            //         nombre: req.body.usuario,
            //         apellido: 'Testing',
            //         password: sha1Hash(req.body.password)
            //     }
            // );
            // usuario.save();
            return next(403);
        }
        return res.json({
            token: Auth.generateUserToken(user)
        });
    };
    // Valida datos
    if (!req.body.usuario || !req.body.password) {
        return next(403);
    }
    // Usar LDAP?
    if (!(config.auth.method === 'ldap')) {
        // Access de prueba
        loginCache();
        // login(req.body.usuario, req.body.usuario);
    } else {
        const server = config.auth.ldap.host + ':' +  config.auth.ldap.port;
        const reachable = await isReachable(server);
        if (!reachable) {
            loginCache();
        } else {
            // Conecta a LDAP
            const dn = 'uid=' + req.body.usuario + ',' + config.auth.ldap.ou;
            const ldap = ldapjs.createClient({url: `ldap://${server}`});
            ldap.bind(dn, req.body.password, (err) => {
                if (err) {
                    return next(ldapjs.InvalidCredentialsError ? 403 : err);
                }
                // Busca el usuario con el UID correcto.
                ldap.search(dn, {
                    scope: 'sub',
                    filter: '(uid=' + req.body.usuario + ')',
                    paged: false,
                    sizeLimit: 1
                }, (err2, searchResult) => {
                    if (err2) {
                        return next(err2);
                    }
                    searchResult.on('searchEntry', (entry) => {
                        login(entry.object.givenName, entry.object.sn);
                    });
                    searchResult.on('error', (err3) => {
                        return next(err3);
                    });
                });
            });
        }
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
