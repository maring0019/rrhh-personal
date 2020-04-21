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
        templateRootPath: env('TEMPLATES_ROOT', path.join(__dirname, '../views'))
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
        mongo: env('MONGO_HOST', 'mongodb://localhost:27017/test')
    },
};
