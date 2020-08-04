import * as path from 'path';

function env(key, _default, type = 's') {
    if (!!process.env[key] === false) {
        return _default;
    }
    const value = process.env[key];
    switch (type) {
        case 'b':
            return value.toLowerCase() === 'true';
        case 'n':
            return parseInt(value, 10);
        default:
            return value;
    }
}

export default {
    app: {
        key: env('JWT_KEY', 'l5lPkNgTL+uiGKg+aJvljKtKhuS0NhWu1ZCo+Ft6s0w='),
        port: env('APP_PORT', 3004, 'n'),
        expiresIn: env('EXPIRS_IN', 1000 * 60 * 60 * 24 * 10, 'n'),
        uploadFilesPath: env('UPLOADS_FOLDER', 'tempUploads'),
        url: env('APP_URL', 'http://localhost'),
        templateRootPath: env('TEMPLATES_ROOT', path.join(__dirname, '../views')),
        publicFolder: env('PUBLIC_FOLDER', path.join(__dirname, '../public'))
    },
    auth: {
        method: env('AUTH', ''),
        ldap: {
            host: env('LADP_HOST', 'localhost'),
            port: env('LADP_PORT', 389),
            ou: env('LADP_OU', '')
        }
    },
    database: {
        // mongo: env('MONGO_HOST', 'mongodb://localhost:27017/test')
        mongo: env('MONGO_HOST', 'mongodb://admin:golitoMon04@mongolito.hospitalneuquen.org.ar:27028/rrhh?authSource=admin')
    }
};

// Configuración de Passport
export const auth = {
    useLdap: env('LDAP', false),
    jwtKey: env('APP_KEY', '5gCYFZPp3dfA2m5UNElVkgRLFcFnBfZp'),
    ldapOU: env('LDAP_HOST', 'ou=People,o=integrabilidad,o=neuquen')
};

// Hosts
export const hosts = {
    ldap: env('LDAP_HOST', 'ldap.neuquen.gov.ar'),
};

// Puerto de LDAP
export const ports = {
    ldapPort: env('LDAP_PORT', ':389')
};
