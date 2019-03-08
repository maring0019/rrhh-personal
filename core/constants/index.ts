export const constantes = {
    SEXO: {
        type: String,
        required: true,
        es_indexed: true,
        enum: ['femenino', 'masculino', 'otro']
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
        enum: ['fijo', 'celular', 'email']
    },
    ESTUDIOS: {
        type: String,
        enum: ['primario', 'secundario', 'terciario', 'universitario', 'postgrado', 'especialidad']
    }
};