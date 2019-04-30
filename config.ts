// Habilita/deshabilita módulos de la API
export const modules = {
    tm: {
        active: true,
        path: './core/tm/routes',
        route: '/core/tm',
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
    }
};

// Cotas de consumo de APIs
export const defaultLimit = 50;
export const maxLimit = 1000;
