import * as bodyParser from 'body-parser';
import * as boolParser from 'express-query-boolean';
import * as HttpStatus from 'http-status-codes';
import { Express } from 'express';
const requireDir = require('require-dir');

import * as config from './config';
import { Connections } from './connections';
import { Auth } from './auth';


export function initAPI(app: Express) {

    // Inicializa la autenticación con Passport/JWT
    Auth.initialize(app);

    // Inicializa Mongoose
    Connections.initialize();

    // Configura Express
    app.use(bodyParser.json({ limit: '150mb' }));
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

    let AUTH = require('./auth');
    app.use('/api/auth/', AUTH.Routes);

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
    app.use((err: any, req, res, next) => {
        let isError = (e) => {
            return e && e.stack && e.message;
        };
        if (err) {
            // Parse err
            let e: { status: number, message: string };
            if (!isNaN(err)) {
                e = {
                    message: HttpStatus.getStatusText(err),
                    status: err
                };
            } else {
                if (isError(err)) {
                    e = {
                        message: err.message,
                        status: 500
                    };
                } else if (typeof err === 'string') {
                    e = {
                        message: err,
                        status: 400
                    };
                } else {
                    e = {
                        message: JSON.stringify(err),
                        status: 400
                    };
                }
            }

            // Send response
            res.status(e.status);
            res.send({
                message: e.message,
                error: (app.get('env') === 'development') ? err : null
            });
        }
    });
}
