export default [
    {
        key: "agentes",
        title: "Módulo de Agentes",
        child: [
            {
                key: "view_agente",
                title: "Ver/Listar Agentes",
                type: "boolean",
            },
            {
                key: "add_agente",
                title: "Alta de Agentes",
                type: "boolean",
            },
            {
                key: "change_agente",
                title: "Modificar un Agente",
                comment: "Permite modificar los datos generales de un agente",
                type: "boolean",
            },
            {
                key: "view_ausentismo",
                title: "Ver Ausentismo",
                comment: "Permite visualizar el ausentismo de los agentes",
                type: "boolean",
            },
            {
                key: "baja_agente",
                title: "Baja de Agente",
                comment: "Permite dar de baja un agente",
                type: "boolean",
            },
            {
                key: "reactivar_agente",
                title: "Reactivar Agente",
                comment: "Permite un agente dado de Baja",
                type: "boolean",
            },
            {
                key: "habilitar_fichado",
                title: "Habilitar Fichado",
                comment: "Habilita a un agente a fichar",
                type: "boolean",
            },
            {
                key: "print_credencial",
                title: "Imprimir Credencial",
                comment: "Permite imprimir las credenciales de un agente",
                type: "boolean",
            },
            {
                key: "add_historialaboral",
                title: "Agregar Historia Laboral",
                comment:
                    "Permite agregar una nueva historia laboral a un agente",
                type: "boolean",
            },
            {
                key: "change_historialaboral",
                title: "Editar Historia Laboral",
                comment: "Permite modificar la historia laboral de los agentes",
                type: "boolean",
            },
            {
                key: "delete_historialaboral",
                title: "Eliminar Historia Laboral",
                comment: "Permite eliminar la historia laboral de los agentes",
                type: "boolean",
            },
            {
                key: "add_nota",
                title: "Agregar Notas",
                comment: "Permite asociar notas a un agente",
                type: "boolean",
            },
            {
                key: "change_nota",
                title: "Modificar Notas",
                comment: "Permite modificar las notas asociadas a un agente",
                type: "boolean",
            },
            {
                key: "delete_nota",
                title: "Eliminar Notas",
                comment: "Permite las notas asociadas a un agente",
                type: "boolean",
            },
        ],
    },
    {
        key: "partes",
        title: "Módulo de Partes",
        child: [
            {
                key: "view_parte",
                title: "Ver/Listar Partes",
                comment: "Permite ver o listar partes.",
                type: "boolean",
            },
            {
                key: "add_parte",
                title: "Crear Partes",
                comment: "Permite crear partes.",
                type: "boolean",
            },
            {
                key: "change_parte",
                title: "Editar Partes",
                comment: "Permite editar partes.",
                type: "boolean",
            },
            {
                key: "confirmar_parte",
                title: "Confirmar Partes",
                comment: "Permite confirmar partes.",
                type: "boolean",
            },
            {
                key: "procesar_parte",
                title: "Procesar un Parte",
                comment:
                    "Permite procesar los partes elaborados por los jefes de servicio",
                type: "boolean",
            },
            {
                key: "report_fichadas",
                title: "Reporte de Ingresos y Egresos",
                comment:
                    "Permite generar un reporte de ingresos y egresos (fichadas)",
                type: "boolean",
            },
            {
                key: "report_partes",
                title: "Reporte de Partes",
                comment: "Permite generar un reporte de Partes",
                type: "boolean",
            },
        ],
    },
    {
        key: "reportes",
        title: "Módulo de Reportes",
        child: [
            {
                key: "report_legajo_agentes",
                title: "Reporte Legajo de Agentes",
                comment: "",
                type: "boolean",
            },
            {
                key: "report_listado_agentes",
                title: "Reporte Listado de Agentes",
                comment: "",
                type: "boolean",
            },
            {
                key: "report_ausentismo",
                title: "Reporte de Ausentismo",
                comment: "",
                type: "boolean",
            },
            {
                key: "report_ausentismo_totales",
                title: "Reporte de Ausentimos. Totales por Articulo",
                comment: "",
                type: "boolean",
            },
            {
                key: "report_licencias",
                title: "Reporte de Licencias",
                comment: "",
                type: "boolean",
            },
        ],
    },
    {
        key: "config",
        title: "Módulo de Configuración",
        child: [
            {
                key: "config-articulos",
                title: "Configuración Articulos",
                child: [
                    {
                        key: "view_articulo",
                        title: "Ver Feriado",
                        comment: "Ver detalle de un Feriado",
                        type: "boolean",
                    },
                    {
                        key: "change_articulo",
                        title: "Modificar Feriado",
                        comment: "Modificar un Feriado",
                        type: "boolean",
                    },
                    {
                        key: "add_articulo",
                        title: "Alta de Feriado",
                        comment: "Alta de Feriado",
                        type: "boolean",
                    },
                    {
                        key: "delete_articulo",
                        title: "Eliminar Feriado",
                        comment: "Eliminar un Feriado",
                        type: "boolean",
                    },
                ],
            },
            {
                key: "config-feriados",
                title: "Configuración Días Feriados",
                child: [
                    {
                        key: "view_feriado",
                        title: "Ver Artículo",
                        comment: "Ver detalle de un Artículo",
                        type: "boolean",
                    },
                    {
                        key: "change_feriado",
                        title: "Modificar Artículo",
                        comment: "Modificar un Artículo",
                        type: "boolean",
                    },
                    {
                        key: "add_feriado",
                        title: "Alta de Artículo",
                        comment: "Alta de Artículo",
                        type: "boolean",
                    },
                    {
                        key: "delete_feriado",
                        title: "Eliminar Artículo",
                        comment: "Eliminar un Artículo",
                        type: "boolean",
                    },
                ],
            },
            {
                key: "config-licencias",
                title: "Configuración Licencias por Año",
                child: [
                    {
                        key: "view_licencia",
                        title: "Ver licencias por año",
                        comment: "",
                        type: "boolean",
                    },
                    {
                        key: "change_licencia",
                        title: "Modificar licencias por año",
                        comment: "",
                        type: "boolean",
                    },
                    {
                        key: "add_licencia",
                        title: "Alta de licencias por año",
                        comment: "",
                        type: "boolean",
                    },
                    {
                        key: "delete_licencia",
                        title: "Eliminar licencias por año",
                        comment: "",
                        type: "boolean",
                    },
                ],
            },
            {
                key: "config-regimenes",
                title: "Configuración de Regímenes",
                child: [
                    {
                        key: "view_regimen",
                        title: "Ver Regimen",
                        comment: "Ver detalle de un Regimen",
                        type: "boolean",
                    },
                    {
                        key: "change_regimen",
                        title: "Modificar Regimen",
                        comment: "Modificar un Regimen",
                        type: "boolean",
                    },
                    {
                        key: "add_regimen",
                        title: "Alta de Regimen",
                        comment: "Alta de Regimen",
                        type: "boolean",
                    },
                    {
                        key: "delete_regimen",
                        title: "Eliminar Regimen",
                        comment: "Eliminar un Regimen",
                        type: "boolean",
                    },
                ],
            },
        ],
    },
    {
        key: "seguridad",
        title: "Módulo de Seguridad",
        child: [
            {
                key: "seguridad-roles",
                title: "Configuración Roles de Usuarios",
                child: [
                    {
                        key: "view_rol",
                        title: "Ver Rol",
                        comment: "Ver detalle de un Rol",
                        type: "boolean",
                    },
                    {
                        key: "change_rol",
                        title: "Modificar Rol",
                        comment: "Permite agregar/quitar permisos a un rol",
                        type: "boolean",
                    },
                    {
                        key: "add_rol",
                        title: "Alta de Rol",
                        comment: "Permite crear un nuevo Rol",
                        type: "boolean",
                    },
                    {
                        key: "delete_rol",
                        title: "Eliminar Rol",
                        comment: "Eliminar un Rol",
                        type: "boolean",
                    },
                ],
            },
        ],
    },
];
