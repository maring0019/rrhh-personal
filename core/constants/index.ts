export const constantes = {
    SEXO: {
        type: String,
        required: true,
        es_indexed: true,
        enum: ['femenino', 'masculino', 'otro']
    },
    GENERO: {
        type: String,
        enum: ['femenino', 'masculino', 'otro', null]
    },
    ESTADOCIVIL: {
        type: String,
        enum: ['casado', 'separado', 'divorciado', 'viudo', 'soltero', 'concubino', 'otro', null]
    },
    PARENTESCO: {
        type: String,
        enum: ['progenitor/a', 'hijo', 'hermano', 'tutor']
    },
    ESTADO: {
        type: String,
        required: true,
        es_indexed: true,
        enum: ['temporal', 'validado', 'recienNacido', 'extranjero']
    },
    CONTACTO: {
        type: String,
        required: true,
        enum: ['fijo', 'celular', 'email']
    },
    ESTUDIOS: {
        type: String,
        required: true,
        enum: ['primario', 'secundario', 'terciario', 'universitario', 'postgrado', 'especialidad']
    },
    TIPOGUARDIA: {
        type: String,
        enum: ['activa', 'pasiva']
    },
};
