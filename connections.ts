const sqlClient = require("mssql");
import * as mongoose from "mongoose";
import * as debug from "debug";
import config from "./confg";

// SQLServer Config
const sqlConfig = {
    user: config.database.sqlserver.user,
    password: config.database.sqlserver.password,
    server: config.database.sqlserver.server,
    database: config.database.sqlserver.database,
    parseJSON: true,
    requestTimeout: 60000,
    connectionTimeout: 60000,
    encrypt: false,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
};

export class SQLServerConnection {
    static connection;
    static sqlServerPool;

    static connect() {
        this.sqlServerPool = new sqlClient.ConnectionPool(sqlConfig);
        this.sqlServerPool.on("error", (err) => {
            console.log("Fallo la conexion al SQLServer");
        });
        this.connection = this.sqlServerPool.connect();
        console.log("SQLServer Connection Established");
    }
}

function schemaDefaults(schema) {
    schema.set("toJSON", {
        virtuals: true,
        versionKey: false,
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
        const queryLogger = debug("mongoose");
        if (queryLogger.enabled) {
            mongoose.set(
                "debug",
                (collection, method, query, arg1, arg2, arg3) =>
                    queryLogger(
                        "%s.%s(%o) %s %s",
                        collection,
                        method,
                        query,
                        arg2 || "",
                        arg3 || ""
                    )
            );
        }

        mongoose.connect(config.database.mongo, {
            useCreateIndex: true,
            useNewUrlParser: true,
            reconnectTries: Number.MAX_VALUE,
            reconnectInterval: 500,
        });
        this.main = mongoose.connection;

        // Configura eventos
        this.configEvents("main", this.main);
    }

    private static configEvents(name: string, connection: mongoose.Connection) {
        const connectionLog = debug("mongoose:" + name);
        connection.on("connecting", () => connectionLog("connecting ..."));
        connection.on("error", (error) => connectionLog(`error: ${error}`));
        connection.on("connected", () => connectionLog("connected"));
        connection.on("reconnected", () => connectionLog("reconnected"));
        connection.on("disconnected", () => connectionLog("disconnected"));
    }
}
