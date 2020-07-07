import * as mongoose from 'mongoose';
import * as debug from 'debug';
import config from './confg';

// const audit = require('./packages/mongoose-audit-trail');

function schemaDefaults(schema) {
    schema.set('toJSON', {
        virtuals: true,
        versionKey: false
    });
}

export class Connections {
    static main: mongoose.Connection;

    /**
     * Inicializa las conexiones a MongoDB
     *
     * @static
     *
     * @memberOf Connections
     */
    static initialize() {
        // Configura Mongoose
        (mongoose as any).Promise = global.Promise;
        mongoose.plugin(schemaDefaults);
        // mongoose.plugin(audit.plugin, { omit: ["_id", "id"] });

        // Configura logger de consultas
        const queryLogger = debug('mongoose');
        if (queryLogger.enabled) {
            mongoose.set('debug', (collection, method, query, arg1, arg2, arg3) => queryLogger('%s.%s(%o) %s %s', collection, method, query, (arg2 || ''), (arg3 || '')));
        }

        mongoose.connect(config.database.mongo, {
            useCreateIndex: true,
            useNewUrlParser: true,
            reconnectTries: Number.MAX_VALUE,
            reconnectInterval: 500
        });
        this.main = mongoose.connection;

        // Configura eventos
        this.configEvents('main', this.main);
    }

    private static configEvents(name: string, connection: mongoose.Connection) {
        const connectionLog = debug('mongoose:' + name);
        connection.on('connecting', () => connectionLog('connecting ...'));
        connection.on('error', (error) => connectionLog(`error: ${error}`));
        connection.on('connected', () => connectionLog('connected'));
        connection.on('reconnected', () => connectionLog('reconnected'));
        connection.on('disconnected', () => connectionLog('disconnected'));
    }
}
