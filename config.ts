
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
    parte:{
        active: true,
        path: './modules/partes/routes',
        route: '/modules/partes',
        middleware: null,
    },
    guardia:{
        active: true,
        path: './modules/guardias/routes',
        route: '/modules/guardias',
        middleware: null,
    },
    recargo:{
        active: true,
        path: './modules/recargos/routes',
        route: '/modules/recargos',
        middleware: null,
    },
    reportes:{
        active: true,
        path: './modules/reportes/routes',
        route: '/modules/reportes',
        middleware: null,
    },
    audit:{
        active: true,
        path: './modules/audit/routes',
        route: '/modules/audits',
        middleware: null,
    },
    nota:{
        active: true,
        path: './modules/notas/routes',
        route: '/modules/notas',
        middleware: null,
    },
    adjunto:{
        active: true,
        path: './modules/adjuntos/routes',
        route: '/modules/adjuntos',
        middleware: null,
    },
    usuario:{
        active: true,
        path: './modules/seguridad/routes',
        route: '/modules/seguridad',
        middleware: null,
    }
};

// Cotas de consumo de APIs
export const defaultLimit = 50;
export const maxLimit = 1000;


