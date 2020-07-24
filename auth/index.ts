
import * as express from 'express';
import * as mongoose from 'mongoose';
import * as passport from 'passport';
import * as passportJWT from 'passport-jwt';
import * as jwt from 'jsonwebtoken';

import { UserToken } from './interfaces/user-token.interface';
import config from '../confg';
import { IUsuarioDoc } from './schemas/Usuarios';

const shiroTrie = require('shiro-trie');

// Simple por ahora
export { Routes } from './routes/routes';

export class Auth {
    /**
     * Inicializa el middleware de auditoría para JSON Web Token
     *
     * @static
     * @param {express.Express} app aplicación de Express
     *
     * @memberOf Auth
     */
    static initialize(app: express.Express) {
        // Configura passport para que utilice JWT
        passport.use(new passportJWT.Strategy(
            {
                secretOrKey: config.app.key,
                jwtFromRequest: passportJWT.ExtractJwt.fromExtractors([
                    passportJWT.ExtractJwt.fromAuthHeaderWithScheme('jwt'),
                    passportJWT.ExtractJwt.fromUrlQueryParameter('token')
                ])
            },
            (jwt_payload, done) => {
                done(null, jwt_payload);
            }
        ));

        // Inicializa passport
        app.use(passport.initialize());
    }



    /**
     * Devuelve una instancia de shiro. Implementa un cache en el request actual para mejorar la performance
     *
     * @private
     * @static
     * @param {express.Request} req Corresponde al request actual
     *
     * @memberOf Auth
     */
    private static getShiro(req: express.Request): any {
        let shiro = (req as any).shiro;
        if (!shiro) {
            shiro = shiroTrie.new();
            shiro.add((req as any).user.permisos);
            (req as any).shiro = shiro;
        }
        return shiro;
    }

    /**
     * Controla si el token contiene el string Shiro
     *
     * @static
     * @param {express.Request} req Corresponde al request actual
     * @param {string} string String para controlar permisos
     * @returns {boolean} Devuelve verdadero si el token contiene el permiso
     *
     * @memberOf Auth
     */
    static check(req: express.Request, string: string): boolean {
        if (!(req as any).user || !(req as any).user.permisos) {
            return false;
        } else {
            return this.getShiro(req).check(string);
        }
    }

    /**
     * Obtiene todos los permisos para el string Shiro indicado
     *
     * @static
     * @param {express.Request} req Corresponde al request actual
     * @param {string} string String para controlar permisos
     * @returns {string[]} Array con permisos
     *
     * @memberOf Auth
     */
    static getPermissions(req: express.Request, string: string): string[] {
        if (!(req as any).user || !(req as any).user.permisos) {
            return null;
        } else {
            return this.getShiro(req).permissions(string);
        }
    }

    /**
     * Genera un token de usuario firmado
     *
     * @static
     * @param {IUsuarioDoc} user Usuario del sistema
     * @returns {*} JWT
     *
     * @memberOf Auth
     */
    static generateUserToken(user: IUsuarioDoc): any {
        const token: UserToken = {
            id: mongoose.Types.ObjectId(),
            usuario: {
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                documento: String(user.usuario)
            },
            type: 'user-token'
        };
        return jwt.sign(token, config.app.key, { expiresIn: config.app.expiresIn });
    }


    /**
     * Regenera un Access Token para entrar en una nueva organizacion
     * @param token Token para refrescar
     * @param {IUsuarioDoc} user Usuario del sistema
     * @returns {*} JWT
     *
     * @memberOf Auth
     */
    static refreshToken(token: string, user: IUsuarioDoc) {
        try {
            jwt.verify(token, config.app.key);
            return this.generateUserToken(user);
        } catch (e) {
            return null;
        }
    }

}
