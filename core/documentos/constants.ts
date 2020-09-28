export const opcionesAgrupamiento = [
    // Datos Personales
    // { id: "1", nombre: "------ Datos Personales --------", grupo:"Datos Personales" },
	{ id: "estadoCivil", nombre: "Estado Civil", grupo:"Datos Personales" },
	{ id: "nacionalidad.nombre", nombre: "Nacionalidad", grupo:"Datos Personales" },
	{ id: "sexo", nombre: "Sexo", grupo:"Datos Personales" },
	// { id: 'sexo', nombre: 'Edad' }, TODO Ver como resolver esta opcion

    // Domicilio
    // { id: "2", nombre: "--------- Domicilio ------------" },
	{ id: "direccion.localidad.nombre", nombre: "Localidad" },
	{ id: "direccion.localidad.provincia.nombre", nombre: "Provincia" },

	// Educacion
	// <option value="60" > Título Primario < /option>
	// < option value = "61" > Título Secundario < /option>
	// < option value = "70" > Título Terciario < /option>
	// < option value = "62" > Título Universitario < /option>
	// < option value = "63" > Postgrado < /option>
	// < option value = "64" > Especialidad < /option>

	// { id: "3", nombre: "----------- Cargo --------------" },
	{ id: "situacionLaboral.cargo.sector.nombre", nombre: "Lugar de Trabajo" },
	{ id: "situacionLaboral.cargo.ubicacion.nombre", nombre: "Servicio" },
	{ id: "situacionLaboral.normaLegal.tipoNormaLegal.nombre", nombre: "Norma Legal" },
	{ id: "situacionLaboral.cargo.puesto.nombre", nombre: "Agrupamiento" },
    { id: "situacionLaboral.cargo.subpuesto.nombre", nombre: "Función" },
    
    // Regimen
    // { id: "4", nombre: "---------- Regimen -------------" },
    { id: "situacionLaboral.regimen.regimenHorario.nombre", nombre: "Regimen horario" },
    { id: "situacionLaboral.regimen.dedicacionExclusiva", nombre: "Dedicación exclusiva" },
    { id: "situacionLaboral.regimen.tiempoPleno", nombre: "Tiempo pleno" },
    { id: "situacionLaboral.regimen.actividadCritica", nombre: "Actividad  crítica" },
    { id: "situacionLaboral.regimen.prolongacionJornada", nombre: "Prolongación de Jornada" },
    { id: "situacionLaboral.regimen.guardiasPasivas", nombre: "Guardias pasivas" },
    { id: "situacionLaboral.regimen.guardiasActivas", nombre: "Guardias activas" },
    
    // Situación
    // { id: "5", nombre: "--------- Situación ------------" },
	{ id: "activo", nombre: "Estado (activo/inactivo)" },
	// { id: 9, nombre: "Causa de Baja" },
	{ id: "situacionLaboral.situacion.nombre.tipoSituacion.nombre", nombre: "Situación en Planta" },
	// { id: 10, nombre: "Años en el Estado" },
	// { id: 10, nombre: "Años en el Hospital" },
    // { id: 10, nombre: "Antigüedad" },
    // { id: 10, nombre: "Traslado" },
];


export const opcionesOrdenamiento = [
	{ id: "apellido", nombre: "Apellido y Nombre" },
	{ id: "numero", nombre: "Número de Legajo" },
	{ id: "documento", nombre: "Documento" },
	{ id: "estadoCivil", nombre: "Estado Civil" },
	{ id: "nacionalidad.nombre", nombre: "Nacionalidad" },
	{ id: "sexo", nombre: "Sexo" },
	// Domicilio
	{ id: "direccion.localidad.nombre", nombre: "Localidad" },
	{ id: "direccion.localidad.provincia.nombre", nombre: "Provincia" },
	// Cargo TODO Terminar de cargar las opciones de ordenamiento
	{
		id: "situacionLaboral.cargo.sector.nombre",
		nombre: "Lugar de Trabajo",
	},
	// { id: 9, nombre: 'Servicio' },
	// { id: 10, nombre: 'Departamento' },
	// { id: 10, nombre: 'Norma Legal' },
	// { id: 10, nombre: 'Categoría' },
	// { id: 10, nombre: 'Función' },
];
