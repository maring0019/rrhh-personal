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
                title: 'Alta de Agentes',
                type: 'boolean'
            },
            {
                key: 'change_agente',
                title: 'Modificar un Agente',
                comment: 'Permite modificar los datos generales de un agente',
                type: 'boolean'
            },
            {
                key: 'view_ausentismo',
                title: 'Ver Ausentismo',
                comment: 'Permite visualizar el ausentismo de los agentes',
                type: 'boolean'
            },
            {
                key: 'add_nota',
                title: 'Agregar Notas',
                comment: 'Permite asociar notas a un agente',
                type: 'boolean'
            },
            {
                key: 'baja_agente',
                title: 'Baja de Agente',
                comment: 'Permite dar de baja un agente',
                type: 'boolean'
            },
            {
                key: 'add_historialaboral',
                title: 'Agregar Historia Laboral',
                comment: 'Permite modificar la historia laboral de los agentes',
                type: 'boolean'
            },
            {
                key: 'print_credencial',
                title: 'Imprimir Credencial',
                comment: 'Permite imprimir las credenciales de un agente',
                type: 'boolean'
            },

        ]
    },
    {
        key: 'partes',
        title: 'Módulo de Partes',
        child: [
            {
                key: 'procesar_parte',
                title: 'Procesar un Parte',
                comment: 'Permite procesar los partes elaborados por los jefes de servicio',
                type: 'boolean'
            },
            {
                key: 'add_parte',
                title: 'Crear Partes',
                comment: 'Permite crear partes.',
                type: 'boolean'
            },
            {
                key: 'report_fichadas',
                title: 'Reporte de Ingresos y Egresos',
                comment: 'Permite generar un reporte de ingresos y egresos (fichadas)',
                type: 'boolean'
            },
            {
                key: 'report_partes',
                title: 'Reporte de Partes',
                comment: 'Permite generar un reporte de Partes',
                type: 'boolean'
            }
        ]
    },
    {
        key: 'config',
        title: 'Módulo de Configuración',
        child: [
            {
                key: 'config-articulos',
                title: 'Configuración Articulos',
                child: [
                    {
                        key: 'view_articulo',
                        title: 'Ver Feriado',
                        comment: 'Ver detalle de un Feriado',
                        type: 'boolean'
                    },
                    {
                        key: 'change_articulo',
                        title: 'Modificar Feriado',
                        comment: 'Modificar un Feriado',
                        type: 'boolean'
                    },
                    {
                        key: 'add_articulo',
                        title: 'Alta de Feriado',
                        comment: 'Alta de Feriado',
                        type: 'boolean'
                    },
                    {
                        key: 'delete_articulo',
                        title: 'Eliminar Feriado',
                        comment: 'Eliminar un Feriado',
                        type: 'boolean'
                    },

                ]
            },
            {
                key: 'config-feriados',
                title: 'Configuración Días Feriados',
                child: [
                    {
                        key: 'view_feriado',
                        title: 'Ver Artículo',
                        comment: 'Ver detalle de un Artículo',
                        type: 'boolean'
                    },
                    {
                        key: 'change_feriado',
                        title: 'Modificar Artículo',
                        comment: 'Modificar un Artículo',
                        type: 'boolean'
                    },
                    {
                        key: 'add_feriado',
                        title: 'Alta de Artículo',
                        comment: 'Alta de Artículo',
                        type: 'boolean'
                    },
                    {
                        key: 'delete_feriado',
                        title: 'Eliminar Artículo',
                        comment: 'Eliminar un Artículo',
                        type: 'boolean'
                    },

                ]
            }
        ]
    }
]
