import BaseDocumentoController from "../../../core/app/basedocumentocontroller";

import { DocumentoLegajoAgente } from "../../../core/documentos/reportes/legajoAgentes";
import { DocumentoListadoAgentes } from "../../../core/documentos/reportes/listadoAgentes";
import { DocumentoAusenciasTotalesPorArticulo } from "../../../core/documentos/reportes/totalesPorArticulo";

import { DocumentoAusenciasPorAgente } from "../../../core/documentos/reportes/ausenciasPorAgente";
import { DocumentoLicenciasPorAgente } from "../../../core/documentos/reportes/licenciasPorAgente";

import { DocumentoConstanciaCertificado } from "../../../core/documentos/constanciaCertificado";
import { DocumentoCredencialAgente } from "../../../core/documentos/credencialAgente";
import { DocumentoParteDiarioAgente } from "../../../core/documentos/partes/parteDiario";
import { DocumentoFichadasAgente } from "../../../core/documentos/partes/fichadas";

import {
	opcionesAgrupamiento,
	opcionesOrdenamiento,
	opcionesVisualizacion,
	opcionesTipoReporte,
} from "../../../core/documentos/constants";


class ReportesController extends BaseDocumentoController {
	constructor() {
		super();
		// Reports
		this.getReporte = this.getReporte.bind(this);
		this.getCredencial = this.getCredencial.bind(this);
		this.downloadCredencial = this.downloadCredencial.bind(this);
		this.getCertificado = this.getCertificado.bind(this);
		this.downloadCertificado = this.downloadCertificado.bind(this);
		this.getPartes = this.getPartes.bind(this);
		this.downloadPartes = this.downloadPartes.bind(this);
	}

	private reportes = {
		// Reportes Generales
		listado_agentes: DocumentoListadoAgentes,
		legajos_agentes: DocumentoLegajoAgente,
		ausentismo: DocumentoAusenciasPorAgente,
		ausentismo_totalesxarticulo: DocumentoAusenciasTotalesPorArticulo,
		licencias_agentes: DocumentoLicenciasPorAgente,
		// ReportesPartes
		fichadas_agentes: DocumentoFichadasAgente
	};

	/**
	 * Genera y retorna un reporte cuyo formato de salida puede ser
	 * HTML o PDF dependiendo de lo indicado en la variable locals
	 * del objeto response. El tipo de reporte a generar tambien se
	 * encuentra en locals. Ambos valores son colocados alli con la
	 * ayuda un de middleware en el router.
	 */
	async getReporte(req, res, next, options = null) {
		const tipoReporte = res.locals.tipoReporte;
		if (!tipoReporte || !this.reportes[tipoReporte])
			return res
				.status(400)
				.send({ message: "El tipo de reporte solicitado no existe" });

		// Instanciamos 'dinamicamente' el tipo de documento a generar
		// a partir del nombre del reporte especificado por parametro en
		// el request. (Ver middleware en el router)
		let doc = new this.reportes[tipoReporte]();
		if (res.locals.formato == "html") {
			return await this.getDocumentoHTML(req, res, next, doc);
		} else {
			return await this.downloadDocumentoPDF(
				req,
				res,
				next,
				doc,
				options
			);
		}
	}

	async getCredencial(req, res, next, options = null) {
		try {
			let doc = new DocumentoCredencialAgente();
			return await this.getDocumentoHTML(req, res, next, doc);
		} catch (err) {
			return next(err);
		}
	}

	async downloadCredencial(req, res, next, options = null) {
		try {
			let doc = new DocumentoCredencialAgente();
			return await this.downloadDocumentoPDF(req, res, next, doc);
		} catch (err) {
			return next(err);
		}
	}

	async getCertificado(req, res, next) {
		try {
			let doc = new DocumentoConstanciaCertificado();
			return await this.getDocumentoHTML(req, res, next, doc);
		} catch (err) {
			return next(err);
		}
	}

	async downloadCertificado(req, res, next, options = null) {
		try {
			let doc = new DocumentoConstanciaCertificado();
			return await this.downloadDocumentoPDF(req, res, next, doc);
		} catch (err) {
			return next(err);
		}
	}

	async getPartes(req, res, next) {
		try {
			let doc = new DocumentoParteDiarioAgente();
			return await this.getDocumentoHTML(req, res, next, doc);
		} catch (err) {
			return next(err);
		}
	}

	async downloadPartes(req, res, next, options = null) {
		try {
			let doc = new DocumentoParteDiarioAgente();
			return await this.downloadDocumentoPDF(req, res, next, doc);
		} catch (err) {
			return next(err);
		}
	}

	async opcionesAgrupamiento(req, res, next) {
		return res.json(opcionesAgrupamiento);
	}

	async opcionesOrdenamiento(req, res, next) {
		return res.json(opcionesOrdenamiento);
	}

	async opcionesVisualizacion(req, res, next) {
		return res.json(opcionesVisualizacion);
	}

	async opcionesTipoReporte(req, res, next) {
		return res.json(opcionesTipoReporte);
	}
}

export default ReportesController;
