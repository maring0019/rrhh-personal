export const opcionesAgrupamiento = [
	{ id: "estadoCivil", nombre: "Estado Civil" },
	{ id: "nacionalidad.nombre", nombre: "Nacionalidad" },
	{ id: "sexo", nombre: "Sexo" },
	// { id: 'sexo', nombre: 'Edad' }, TODO Ver como resolver esta opcion
	// Domicilio
	{ id: "direccion.localidad.nombre", nombre: "Localidad" },
	{ id: "direccion.localidad.provincia.nombre", nombre: "Provincia" },
	// Cargo TODO Implementar todas las opciones
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
