export default [
    {
        key: 'agentes',
        title: 'Módulo de Agentes',
        child: [
            {
                key: 'view_agente',
                title: 'Ver/Listar Agentes',
                type: 'boolean'
            },
            {
                key: 'add_agente',
                title: 'Crear Agentes',
                type: 'boolean'
            },
            {
                key: 'change_agente',
                title: 'Modificar un Agente',
                comment: 'Permite modificar los datos generales de un agente',
                type: 'boolean'
            }
        ]
    },
    {
        key: 'partes',
        title: 'Módulo de Partes',
        child: [
            {
                key: 'view_parte',
                title: 'Ver/Listar Partes',
                type: 'boolean'
            },
            {
                key: 'add_parte',
                title: 'Crear Partes',
                type: 'boolean'
            },
            {
                key: 'change_parte',
                title: 'Modificar un Parte',
                comment: 'Permite modificar los datos generales de un agente',
                type: 'boolean'
            }
        ]
    }
]
