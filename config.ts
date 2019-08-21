import * as path from 'path';

// Habilita/deshabilita módulos de la API
export const modules = {
    tm: {
        active: true,
        path: './core/tm/routes',
        route: '/core/tm',
        middleware: null,
    },
    files:{
        active: true,
        path: './core/files/routes',
        route: '/core/files',
        middleware: null,
    },
    descargas:{
        active: true,
        path: './core/descargas/routes',
        route: '/core/descargas',
        middleware: null,
    },
    organigrama: {
        active: true,
        path: './core/organigrama/routes',
        route: '/core/organigrama',
        middleware: null,
    },
    agentes:{
        active: true,
        path: './modules/agentes/routes',
        route: '/modules/agentes',
        middleware: null,
    },
    ausentismo:{
        active: true,
        path: './modules/ausentismo/routes',
        route: '/modules/ausentismo',
        middleware: null,
    },
    reportes:{
        active: true,
        path: './modules/reportes/routes',
        route: '/modules/reportes',
        middleware: null,
    }
};

// Cotas de consumo de APIs
export const defaultLimit = 50;
export const maxLimit = 1000;
export const uploadFilesPath = 'tempUploads'

// Templates html para generar pdfs
export const templateRootPath = path.join(__dirname, './views');


