import * as fs from "fs";
import * as pdf from "html-pdf";
import * as scss from "node-sass";
import * as path from "path";

import * as ejs from "ejs";

import config from "../../confg";

const moment = require("moment");
moment.locale('es');

export class PrintUtils {
    formatDate(value: any, arg1: string): any {
        if ( value ){
            if (arg1) {
                if (arg1 === 'diahora') return moment(value).utc().format('ddd DD/MM HH:mm');
                if (arg1 === 'utc') return moment(value).utc().format('DD/MM/YYYY');
                if (arg1 === 'dia') return moment(value).utc().format('dddd');
                if (arg1 === 'diasmall') return moment(value).utc().format('dd');
                if (arg1 === 'diames') return moment(value).utc().format('DD/MM');
                if (arg1 === 'duracion') return this.duracion(value);
            } else {
                return moment(value).format('DD/MM/YYYY');
            }
        }
        else {
            return "---";
        }
        
    }

    duracion(milisegundos){
        const tempTime = moment.duration(milisegundos);
        return tempTime.hours() + "hs. " + tempTime.minutes() + "min. ";
	}
	
	baseURL(){
		return `${config.app.url}:${config.app.port}`;
	}

}

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
	isPrintable = false;
	printUtils = new PrintUtils();

	request: any;

	constructor(printable:boolean=false){
		this.isPrintable = printable;
	}

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

	/**
	 * Override this method to add custom css per document.
	 */
	protected getCSSFiles(){
		return ["css/reset.scss"];
	}

	/**
	 * Override este metodo para proveer de datos al 'template'.
	 * Este metodo es uno de los mas importantes porque aqui se debe
	 * recuperar y enviar toda la informacion necesaria para que el
	 * template la renderize (ejs). 
	 */
	protected async getContextData() {
		return this.ctx;
	}

	protected getExtraScripts(){
		return { printUtils: new PrintUtils()}
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
				right: "0.25cm",
				// bottom: "3cm",
				left: "0cm",
			},
			header: {
				height: "0.25cm",
			},
			footer: {
				height: "1.5cm",
				contents: {},
			},
		};

		DocumentoPDF.options = (Object.keys(DocumentoPDF.options).length)? DocumentoPDF.options : phantomPDFOptions;
		return DocumentoPDF.options;
	}

	protected generarCSS() {
		let css = "<style>\n\n";
		let files = this.getCSSFiles();
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
		let extraScripts = this.getExtraScripts();
		let html = this.parseHTML(htmlTemplate, {...ctx, ...extraScripts});
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