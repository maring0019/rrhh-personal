export default [
    // Módulo de Agentes
    {
        key: "agentes",
        title: "Módulo de Agentes",
        childs: [
            {
                key: "agente",
                title: "Agentes",
                childs: [
                    {
                        key: "add_agente",
                        title: "Alta de Agentes",
                        type: "boolean",
                    },
                    {
                        key: "view_agente",
                        title: "Ver/Listar Agentes",
                        type: "boolean",
                    },
                    {
                        key: "change_agente",
                        title: "Modificar un Agente",
                        comment:
                            "Permite modificar los datos generales de un agente",
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
                        key: "inhabilitar_fichado",
                        title: "Inhabilitar Fichado",
                        comment: "Inhabilita a un agente a fichar",
                        type: "boolean",
                    },
                    {
                        key: "view_fichado",
                        title: "Ver Estado Fichado",
                        comment:
                            "Permite ver si un agente esta habilitado o no a fichar",
                        type: "boolean",
                    },
                    {
                        key: "print_credencial",
                        title: "Imprimir Credencial",
                        comment:
                            "Permite imprimir las credenciales de un agente",
                        type: "boolean",
                    },
                ],
            },
            {
                key: "historia",
                title: "Historia Laboral",
                childs: [
                    {
                        key: "add_historialaboral",
                        title: "Agregar Historia Laboral",
                        comment:
                            "Permite agregar una nueva historia laboral a un agente",
                        type: "boolean",
                    },
                    {
                        key: "view_historialaboral",
                        title: "Ver Historia Laboral",
                        comment: "Permite ver la historia laboral a un agente",
                        type: "boolean",
                    },
                    {
                        key: "change_historialaboral",
                        title: "Editar Historia Laboral",
                        comment:
                            "Permite modificar la historia laboral de los agentes",
                        type: "boolean",
                    },
                    {
                        key: "delete_historialaboral",
                        title: "Eliminar Historia Laboral",
                        comment:
                            "Permite eliminar la historia laboral de los agentes",
                        type: "boolean",
                    },
                ],
            },
            {
                key: "nota",
                title: "Notas",
                childs: [
                    {
                        key: "add_nota",
                        title: "Agregar Notas",
                        comment: "Permite asociar notas a un agente",
                        type: "boolean",
                    },
                    {
                        key: "view_nota",
                        title: "Ver Notas",
                        comment: "Permite ver las notas a un agente",
                        type: "boolean",
                    },
                    {
                        key: "change_nota",
                        title: "Modificar Notas",
                        comment:
                            "Permite modificar las notas asociadas a un agente",
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
                key: "ausentismo",
                title: "Ausentismo",
                childs: [
                    {
                        key: "add_ausentismo",
                        title: "Agregar Ausencias",
                        comment: "Permite cargar ausencias a un agente",
                        type: "boolean",
                    },
                    {
                        key: "change_ausentismo",
                        title: "Modificar Ausencias",
                        comment: "Permite modificar las ausencias a un agente",
                        type: "boolean",
                    },
                    {
                        key: "view_ausentismo",
                        title: "Ver Ausencias",
                        comment:
                            "Permite visualizar el ausentismo de los agentes",
                        type: "boolean",
                    },
                    {
                        key: "delete_ausentismo",
                        title: "Eliminar Ausencias",
                        comment: "Permite eliminar las ausencias de un agente",
                        type: "boolean",
                    },
                ],
            },
        ],
    },
    // Módulo de Partes
    {
        key: "partes",
        title: "Módulo de Partes",
        childs: [
            {
                key: "parte",
                title: "Partes",
                childs: [
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
                ],
            },
            {
                key: "reporte",
                title: "Reportes",
                childs: [
                    {
                        key: "fichadas",
                        title: "Reporte de Ingresos y Egresos",
                        comment:
                            "Permite generar un reporte de ingresos y egresos (fichadas)",
                        type: "boolean",
                    },
                    {
                        key: "partes",
                        title: "Reporte de Partes",
                        comment: "Permite generar un reporte de Partes",
                        type: "boolean",
                    },
                ],
            },
        ],
    },
    // Módulo de Guardias
    {
        key: "guardias",
        title: "Módulo de Guardias",
        childs: [
            {
                key: "guardia",
                title: "Guardias",
                childs: [
                    {
                        key: "view_guardia",
                        title: "Ver/Listar Guardias",
                        comment: "Permite ver o listar guardias.",
                        type: "boolean",
                    },
                    {
                        key: "add_guardia",
                        title: "Crear Guardia",
                        comment: "Permite crear guardias.",
                        type: "boolean",
                    },
                    {
                        key: "change_guardia",
                        title: "Editar Guardia",
                        comment: "Permite editar guardias.",
                        type: "boolean",
                    },
                    {
                        key: "confirmar_guardia",
                        title: "Confirmar Guardia",
                        comment: "Permite confirmar guardias.",
                        type: "boolean",
                    },
                    {
                        key: "procesar_guardia",
                        title: "Permite procesar una Guardia",
                        comment:
                            "Permite procesar las guardias elaboradas por los jefes de servicio",
                        type: "boolean",
                    },
                    {
                        key: "exportar_csv",
                        title: "Permite exportar Guardia al formato CSV",
                        comment: "Permite exportar una guardia al formato CSV",
                        type: "boolean",
                    },
                ],
            }
        ],
    },
    // Módulo de Recargos
    {
        key: "recargos",
        title: "Módulo de Recargos",
        childs: [
            {
                key: "recargo",
                title: "Recargos",
                childs: [
                    {
                        key: "view_recargo",
                        title: "Ver/Listar Recargos",
                        comment: "Permite ver o listar recargos.",
                        type: "boolean",
                    },
                    {
                        key: "add_recargo",
                        title: "Crear Recargo",
                        comment: "Permite crear recargos.",
                        type: "boolean",
                    },
                    {
                        key: "change_recargo",
                        title: "Editar Recargo",
                        comment: "Permite editar recargos.",
                        type: "boolean",
                    },
                    {
                        key: "confirmar_recargo",
                        title: "Confirmar Recargo",
                        comment: "Permite confirmar recargos.",
                        type: "boolean",
                    },
                    {
                        key: "procesar_recargo",
                        title: "Permite procesar una Recargo",
                        comment:
                            "Permite procesar las recargos elaboradas por los jefes de servicio",
                        type: "boolean",
                    },
                    {
                        key: "imprimir",
                        title: "Permite imprimir un recargo",
                        comment: "Permite imprimir un recargo al formato PDF",
                        type: "boolean",
                    },
                ],
            }
        ],
    },
    // Módulo de Hs Extras
    {
        key: "horas_extras",
        title: "Módulo de Horas Extras",
        childs: [
            {
                key: "hora_extra",
                title: "Horas Extras",
                childs: [
                    {
                        key: "view_hora_extra",
                        title: "Ver/Listar Horas Extras",
                        comment: "Permite ver o listar horas extras.",
                        type: "boolean",
                    },
                    {
                        key: "add_hora_extra",
                        title: "Crear Hora Extra",
                        comment: "Permite crear horas extras.",
                        type: "boolean",
                    },
                    {
                        key: "change_hora_extra",
                        title: "Editar Hora Extra",
                        comment: "Permite editar horas extras.",
                        type: "boolean",
                    },
                    {
                        key: "confirmar_hora_extra",
                        title: "Confirmar Hora Extra",
                        comment: "Permite confirmar horas extras.",
                        type: "boolean",
                    },
                    {
                        key: "procesar_hora_extra",
                        title: "Permite procesar una Hora Extra",
                        comment:
                            "Permite procesar las horas extras elaboradas por los jefes de servicio",
                        type: "boolean",
                    },
                    {
                        key: "imprimir",
                        title: "Permite imprimir horas extras",
                        comment: "Permite imprimir horas extras al formato PDF",
                        type: "boolean",
                    },
                ],
            }
        ],
    },
    // Módulo de Reportes
    {
        key: "reportes",
        title: "Módulo de Reportes",
        childs: [
            {
                key: "agente",
                title: "Reportes Agentes",
                childs: [
                    {
                        key: "legajo_agentes",
                        title: "Legajo de Agentes",
                        comment: "",
                        type: "boolean",
                    },

                    {
                        key: "listado_agentes",
                        title: "Listado de Agentes",
                        comment: "",
                        type: "boolean",
                    },
                ],
            },
            {
                key: "ausentismo",
                title: "Reportes Ausentismo",
                childs: [
                    {
                        key: "ausentismo",
                        title: "Ausentismo",
                        comment: "",
                        type: "boolean",
                    },
                    {
                        key: "ausentismo_totales",
                        title: "Ausentimos. Totales por Articulo",
                        comment: "",
                        type: "boolean",
                    },
                    {
                        key: "licencias",
                        title: "Licencias",
                        comment: "",
                        type: "boolean",
                    },
                ],
            },
        ],
    },
    // Módulo de Configuración
    {
        key: "config",
        title: "Módulo de Configuración",
        childs: [
            {
                key: "feriado",
                title: "Feriados",
                childs: [
                    {
                        key: "view_feriado",
                        title: "Ver Feriado",
                        comment: "Ver detalle de un Feriado",
                        type: "boolean",
                    },
                    {
                        key: "change_feriado",
                        title: "Modificar Feriado",
                        comment: "Modificar un Feriado",
                        type: "boolean",
                    },
                    {
                        key: "add_feriado",
                        title: "Alta de Feriado",
                        comment: "Alta de Feriado",
                        type: "boolean",
                    },
                    {
                        key: "delete_feriado",
                        title: "Eliminar Feriado",
                        comment: "Eliminar un Feriado",
                        type: "boolean",
                    },
                ],
            },
            {
                key: "articulo",
                title: "Articulos",
                childs: [
                    {
                        key: "view_articulo",
                        title: "Ver Artículo",
                        comment: "Ver detalle de un Artículo",
                        type: "boolean",
                    },
                    {
                        key: "change_articulo",
                        title: "Modificar Artículo",
                        comment: "Modificar un Artículo",
                        type: "boolean",
                    },
                    {
                        key: "add_articulo",
                        title: "Alta de Artículo",
                        comment: "Alta de Artículo",
                        type: "boolean",
                    },
                    {
                        key: "delete_articulo",
                        title: "Eliminar Artículo",
                        comment: "Eliminar un Artículo",
                        type: "boolean",
                    },
                ],
            },
            {
                key: "licencia",
                title: "Licencias por Año",
                childs: [
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
                key: "regimen",
                title: "Regímenes",
                childs: [
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
            {
                key: "guardia_lote",
                title: "Guardia Lotes",
                childs: [
                    {
                        key: "add_lote",
                        title: "Alta de un Lote",
                        comment: "Alta de Lote",
                        type: "boolean",
                    },
                    {
                        key: "view_lote",
                        title: "Ver Lote",
                        comment: "Ver detalle de un Lote",
                        type: "boolean",
                    },
                    {
                        key: "change_lote",
                        title: "Modificar Lote",
                        comment: "Modificar un Lote",
                        type: "boolean",
                    },
                    {
                        key: "delete_lote",
                        title: "Eliminar un Lote",
                        comment: "Eliminar un Lote",
                        type: "boolean",
                    },
                ],
            },
            {
                key: "guardia_periodo",
                title: "Guardia Lotes",
                childs: [
                    {
                        key: "add_periodo",
                        title: "Alta de un Periodo",
                        comment: "Alta de Periodo",
                        type: "boolean",
                    },
                    {
                        key: "view_periodo",
                        title: "Ver Periodo",
                        comment: "Ver detalle de un Periodo",
                        type: "boolean",
                    },
                    {
                        key: "change_periodo",
                        title: "Modificar Periodo",
                        comment: "Modificar un Periodo",
                        type: "boolean",
                    },
                    {
                        key: "delete_periodo",
                        title: "Eliminar un Periodo",
                        comment: "Eliminar un Periodo",
                        type: "boolean",
                    },
                ],
            },
            {
                key: "recargo_turno",
                title: "Recargo Turnos",
                childs: [
                    {
                        key: "add_turno",
                        title: "Alta de un Turno",
                        comment: "Alta de Turno",
                        type: "boolean",
                    },
                    {
                        key: "view_turno",
                        title: "Ver Turno",
                        comment: "Ver detalle de un Turno",
                        type: "boolean",
                    },
                    {
                        key: "change_turno",
                        title: "Modificar Turno",
                        comment: "Modificar un Turno",
                        type: "boolean",
                    },
                    {
                        key: "delete_turno",
                        title: "Eliminar un Turno",
                        comment: "Eliminar un Turno",
                        type: "boolean",
                    },
                ],
            },
            {
                key: "recargo_justificacion",
                title: "Recargo Justificaciones",
                childs: [
                    {
                        key: "add_justificacion",
                        title: "Alta de una Justificación",
                        comment: "Alta de Justificación",
                        type: "boolean",
                    },
                    {
                        key: "view_justificacion",
                        title: "Ver Justificación",
                        comment: "Ver detalle de una Justificación",
                        type: "boolean",
                    },
                    {
                        key: "change_justificacion",
                        title: "Modificar Justificación",
                        comment: "Modificar una Justificación",
                        type: "boolean",
                    },
                    {
                        key: "delete_justificacion",
                        title: "Eliminar una Justificación",
                        comment: "Eliminar una Justificación",
                        type: "boolean",
                    },
                ],
            },
        ],
    },
    // Módulo de Seguridad
    {
        key: "seguridad",
        title: "Módulo de Seguridad",
        childs: [
            {
                key: "usuario",
                title: "Usuarios",
                childs: [
                    {
                        key: "view_usuario",
                        title: "Ver Usuario",
                        comment: "Ver detalle de un Usuario",
                        type: "boolean",
                    },
                    {
                        key: "change_usuario",
                        title: "Modificar Usuario",
                        comment:
                            "Permite modificar los permisos/roles a un usuario",
                        type: "boolean",
                    },
                    {
                        key: "add_usuario",
                        title: "Alta de Usuario",
                        comment: "Permite crear nuevos usuarios",
                        type: "boolean",
                    },
                    {
                        key: "delete_usuario",
                        title: "Eliminar Usuario",
                        comment: "Eliminar usuarios",
                        type: "boolean",
                    },
                ],
            },
            {
                key: "rol",
                title: "Roles",
                childs: [
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
