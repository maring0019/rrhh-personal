import * as fs from 'fs';
import * as pdf from 'html-pdf';
import * as scss from 'node-sass';
import * as path from 'path';

import * as config from '../../config';

/**
 * Base Class para generar dpcumentos PDF. 
 */
export class DocumentoPDF {

    templateName:any;
    template:any;
    HTML:any = '';
    ctx:any = {};
    outputFilename = 'documento.pdf';
    
    request:any;

    private static options: pdf.CreateOptions = {};

    protected getTemplateName(){
        if (this.templateName){
            return this.templateName;
        }
        else{
            throw new Error('No se indico ningun path para leer el template');
        }
    }

    protected getTemplate(){
        if (this.template) {
            return this.template;
        }
        else{
            // Try to read template from filesystem
            if (this.getTemplateName()){
                try {
                    let template = fs.readFileSync(path.join(config.templateRootPath, this.getTemplateName()), 'utf8');
                    return template;
                }
                catch(fileError){
                    throw new Error('No se pudo leer el path indicado');
                }
            }
            else{
                throw new Error('No HTML Template to read');
            }
        }
        
    }

    protected async getContextData(){
        return this.ctx;
    }

    protected getOutputFilename(){
        return this.outputFilename;
    }

    protected getDocumentoOptions(){
        let phantomPDFOptions: pdf.CreateOptions = {
            format: 'A4',
            border: {
                // default is 0, units: mm, cm, in, px
                top: '.25cm',
                right: '0cm',
                bottom: '3cm',
                left: '0cm'
            },
            header: {
                height: '5.75cm',
            },
            footer: {
                height: '1cm',
                contents: {}
            }
        };

        DocumentoPDF.options = DocumentoPDF.options || phantomPDFOptions;
        let options = DocumentoPDF.options || phantomPDFOptions;
        return options;
    }

    protected generarCSS() {
         let scssFile = path.join(config.templateRootPath, 'styles/main.scss');
         let css = '<style>\n\n';
         css += scss.renderSync({ // SCSS => CSS
             file: scssFile
         }).css;
         css += '</style>';
         return css;
    }

    protected parseHTML(htmlTemplate, ctx){
        let html = this.HTML? this.HTML : htmlTemplate ;
        Object.keys(ctx).forEach(function(key) {
            html = html.replace(key, ctx[key])
          })
          return html;
    }

    async generarHTML() {
        let htmlTemplate = this.getTemplate();
        let ctx = await this.getContextData();
        let html = this.parseHTML(htmlTemplate, ctx);
        html = html + this.generarCSS();
        return html    
    }

    async generarPDFFile(html){
        return new Promise((resolve, reject) => {
            let options = this.getDocumentoOptions();
            pdf.create(html, options).toFile(this.getOutputFilename(), (err, file): any => {
                if (err) {
                    reject(err);
                }
                resolve(file.filename);
            });
        });
    }

    async generarPDF(req) {
        try {
            this.request  = req;
            let html = await this.generarHTML();
            let file = await this.generarPDFFile(html);
            return file;
        }
        catch(err){
            return err;
        }
    }

}