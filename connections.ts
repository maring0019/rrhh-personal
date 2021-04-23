const sqlClient = require("mssql");
import * as mongoose from "mongoose";
import * as debug from "debug";
import config from "./confg";

// SQLServer Hospital (Sistema Legacy) Config
const sqlConfigHospital = {
    user: config.database.sqlserverHospital.user,
    password: config.database.sqlserverHospital.password,
    server: config.database.sqlserverHospital.server,
    database: config.database.sqlserverHospital.database,
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

// SQLServer Anviz (Fichador) Config
const sqlConfigAnviz = {
    user: config.database.sqlserverAnviz.user,
    password: config.database.sqlserverAnviz.password,
    server: config.database.sqlserverAnviz.server,
    database: config.database.sqlserverAnviz.database,
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
    static sqlConfig;
    static connection;
    static sqlServerPool;

    static connect() {
        this.sqlServerPool = new sqlClient.ConnectionPool(this.sqlConfig);
        this.sqlServerPool.on("error", (err) => {
            console.log("Fallo la conexion al SQLServer. Database:" + this.sqlConfig.database);
        });
        this.connection = this.sqlServerPool.connect();
    }
}

export class SQLServerHospitalCon extends SQLServerConnection {
    static sqlConfig = sqlConfigHospital;
}

export class SQLServerAnvizCon extends SQLServerConnection {
    static sqlConfig = sqlConfigAnviz;
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
