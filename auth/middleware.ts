import * as passport from 'passport';
import * as passportJWT from 'passport-jwt';
import * as jwt from 'jsonwebtoken';
import config from '../confg';

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
        passport.authenticate('jwt', { session: false })
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
