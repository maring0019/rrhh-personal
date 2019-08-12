import { DocumentoPDF } from './documentos';
import { Types } from 'mongoose';
import { AusenciaPeriodo } from '../../modules/ausentismo/schemas/ausenciaPeriodo';

export class DocumentoConstanciaCertificado extends DocumentoPDF {

    templateName = 'ausentismo/constanciaCertificado.html';
    outputFilename = './constanciaCertificado.pdf'
    

    async getContextData(){
        const id = this.request.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))){
            console.log('No se encontro el ausentimo');    
        };
        // let obj:any = 
        await AusenciaPeriodo.findById(id);
        const today = this.todayFormatted();
        const agente = 'NIEVAS, DAVID';
        const fechaHora = `<p><strong>Neuquen, ${today}</strong></p>`

        const informe = `<p>Recibi a la fecha y hora, certificado medico correspondiente al agente ${agente}
                        (Revista nro , Documento: ${agente})</p>`
        return {
            '<!-- FechaHora -->': fechaHora,
            '<!-- Informe -->': informe
        }
    }

    todayFormatted():String{
        let date = new Date();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
}