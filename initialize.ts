import * as bodyParser from 'body-parser';
import * as boolParser from 'express-query-boolean';
// import * as HttpStatus from 'http-status-codes';
import { Express } from 'express';
const requireDir = require('require-dir');

import * as config from './config';
import { Connections } from './connections';
import { Auth } from './auth';
import errorMiddleware from './middleware/error.middleware';
import loggerMiddleware from './middleware/logger.middleware';

const audit = require('./packages/mongoose-audit-trail');

export function initAPI(app: Express) {

    // Inicializa la autenticación con Passport/JWT
    Auth.initialize(app);

    // Inicializa Mongoose
    Connections.initialize();

    // Configura Express
    app.use(bodyParser.json({ limit: '300mb' }));
    app.use(boolParser());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.all('*', (req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        // Permitir que el método OPTIONS funcione sin autenticación
        if ('OPTIONS' === req.method) {
            res.header('Access-Control-Max-Age', '1728000');
            res.sendStatus(200);
        } else {
            next();
        }
    });

    // LOAD ALL ROUTES
    app.use(loggerMiddleware);
    
    let AUTH = require('./auth');
    app.use('/api/auth/', AUTH.Routes);

    // app.use(Auth.authenticate());
    app.use(audit.middleware); 
    for (const m in config.modules) {
        if (config.modules[m].active) {
            const routes = requireDir(config.modules[m].path);
            for (const route in routes) {
                if (config.modules[m].middleware) {
                    app.use('/api' + config.modules[m].route,
                        config.modules[m].middleware, routes[route]['Routes']);
                } else {
                    app.use('/api' + config.modules[m].route,
                        routes[route]['Routes']);
                }
            }
        }
    }
    
    // Error handler
    app.use(errorMiddleware);
}
