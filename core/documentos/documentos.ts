import * as fs from "fs";
import * as pdf from "html-pdf";
import * as scss from "node-sass";
import * as path from "path";

import * as ejs from "ejs";

import config from "../../confg";

/**
 * Base Class para generar dpcumentos PDF.
 */
export class DocumentoPDF {
	templateName: any;
	template: any;
	html: any = "";
	ctx: any = {};
	outputFilename = "documento.pdf";
	headerLogo = `${config.app.url}:${config.app.port}/static/images/logo_hospital.jpeg`;

	request: any;

	private static options: pdf.CreateOptions = {};

	protected getTemplateName() {
		if (this.templateName) {
			return this.templateName;
		} else {
			throw new Error("No se indico ningun path para leer el template");
		}
	}

	protected getTemplate() {
		if (this.template) {
			return this.template;
		} else {
			// Try to read template from filesystem
			if (this.getTemplateName()) {
				try {
					let template = fs.readFileSync(
						path.join(
							config.app.templateRootPath,
							this.getTemplateName()
						),
						"utf8"
					);
					return template;
				} catch (fileError) {
					throw new Error("No se pudo leer el path indicado");
				}
			} else {
				throw new Error("No HTML Template to read");
			}
		}
	}

	private getFilePath() {
		return path.join(config.app.templateRootPath, this.getTemplateName());
	}

	protected async getContextData() {
		return this.ctx;
	}

	protected getOutputFilename() {
		return this.outputFilename;
	}

	protected getDocumentoOptions() {
		let phantomPDFOptions: pdf.CreateOptions = {
			format: "A4",
			border: {
				// default is 0, units: mm, cm, in, px
				top: "0.25cm",
				right: "0cm",
				// bottom: "3cm",
				left: "0cm",
			},
			header: {
				height: "0.25cm",
			},
			footer: {
				height: "1.15cm",
				contents: {},
			},
		};

		DocumentoPDF.options = (Object.keys(DocumentoPDF.options).length)? DocumentoPDF.options : phantomPDFOptions;
		return DocumentoPDF.options;
	}

	protected generarCSS() {
		let css = "<style>\n\n";
		let files = ["css/style.scss"];
		for (const file of files) {
			let scssFile = path.join(config.app.publicFolder, file);
			css += scss.renderSync({
				// SCSS => CSS
				file: scssFile,
			}).css;
		}
		css += "</style>";
		return css;
	}

	protected parseHTML(htmlTemplate, ctx) {
		let htmlStr = this.html ? this.html : htmlTemplate;
		return ejs.render(htmlStr, ctx, { filename: this.getFilePath() });
	}

	async generarHTML() {
		let htmlTemplate = this.getTemplate();
		let ctx = await this.getContextData();
		let html = this.parseHTML(htmlTemplate, ctx);
		html = html + this.generarCSS();
		return html;
	}

	async generarPDFFile(html) {
		return new Promise((resolve, reject) => {
			let options = this.getDocumentoOptions();
			pdf.create(html, options).toFile(
				this.getOutputFilename(),
				(err, file): any => {
					if (err) {
						reject(err);
					}
					resolve(file.filename);
				}
			);
		});
	}

	async getPDF(req) {
		try {
			this.request = req;
			let html = await this.generarHTML();
			let file = await this.generarPDFFile(html);
			return file;
		} catch (err) {
			return err;
		}
	}

	async getHTML(req) {
		this.request = req;
		let html = await this.generarHTML();
		return html;
	}
}
