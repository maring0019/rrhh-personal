import * as passport from 'passport';
import * as passportJWT from 'passport-jwt';
import * as jwt from 'jsonwebtoken';
import config from '../confg';
import { Usuario } from './schemas/Usuarios';
import { Agente } from '../modules/agentes/schemas/agente';

/**
 * Autentica la ejecución de un middleware
 *
 * @static
 * @returns Middleware de Express.js
 *
 * @memberOf Auth
 */
export const authenticate = () => {
    return [
        passport.authenticate('jwt', { session: false }),
        // extractToken(),
        // recovertPayloadMiddleware()
    ];
};

export const authenticateSession = () => {
    return [
        passport.authenticate('jwt', { session: false }),
        extractToken(),
        recovertPayload(),
    ];
};

export const authenticatePublic = () => {
    return passport.authenticate();
};


export const validateToken = (token) => {
    try {
        let tokenData = jwt.verify(token, config.app.key);
        if (tokenData) {
            return tokenData;
        }
        return null;
    } catch (e) {
        return null;
    }
};


/**
* optionalAuth: extract
* falta chequear la expiración
*/
export const optionalAuth = () => {
    return (req, res, next) => {
        try {
            const extractor = passportJWT.ExtractJwt.fromAuthHeaderWithScheme('jwt');
            const token = extractor(req);
            const tokenData = jwt.verify(token, config.app.key);
            if (tokenData) {
                req.user = tokenData;
            }
            next();
        } catch (e) {
            next();
        }
    };
};


/**
* Extrack token middleware
*/
export const extractToken = () => {
    return (req, _res, next) => {
        if (req.headers && req.headers.authorization) {
            req.token = req.headers.authorization.substring(4);
        } else if (req.query.token) {
            req.token = req.query.token;
        }
        next();
    };
};

/**
 * Middleware
 * Must execute before authenticate and extractToken middlewares
 * Carga datos extra del usuario, permisos, etc.
 */
export const recovertPayload = () => {
    return async (req, res, next) => {
        if (!req.user && !req.token) next();
        const fullToken = await getTokenPayload(req.token, req.user);
        req.user = fullToken;
        return next();
    };
}

/**
 * Recupera datos extras del Token. Seria conveniente utilizar
 * una cache como lo hace ANDES.
 * @param token 
 * @param user
 */
async function getTokenPayload(token, user) {
    //La idea es utilizar el token como una hash key para una cache
    //en el futuro y extrear desde ahi (la cache) la informacion 
    //extra del usuario. 
    let usuario = await Usuario.findOne({ usuario: user.usuario.documento });
    let agente:any = await Agente.findOne({ documento: user.usuario.documento });
    let permisos = [];
    let payload = {
        usuario : usuario,
        profesional: agente,
        servicios: agente.servicios(),
        permisos: permisos
    }
    return payload;
}


