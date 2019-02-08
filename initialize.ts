import * as bodyParser from 'body-parser';
import * as boolParser from 'express-query-boolean';
import * as HttpStatus from 'http-status-codes';
import { Connections } from './connections';
import { Auth } from './auth';
import { Express } from 'express';


export function initAPI(app: Express) {

    Connections.initialize();

    // Inicializa la autenticación con Passport/JWT
    Auth.initialize(app);

    // Inicializa Mongoose

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
