import { DocumentoPDF } from "../documentos";
import { Agente } from "../../../modules/agentes/schemas/agente";
import { Types } from "mongoose";
import { title } from "../utils";


export class DocumentoLegajoAgente extends DocumentoPDF {
    templateName = 'reportes/legajo.ejs';
    outputFilename = './legajo.pdf';

    generarCSS() {
        return '';
    }
    
    async getContextData(){
        // Este reporte no tiene opciones de agrupamiento
        
        // Filters
        let agentesId = [Types.ObjectId('5ceee34e7fb49803482727c1'), Types.ObjectId('5ceee3437fb498034827221a')];
        // let activo = true;
        // let cargosId = {}; // Sinonimo de Lugar de Pago
        // Sort
        let sortOrder = -1;
        
        // Search Pipeline
        let pipeline:any = [
            { 
                $match: { 
                    '_id': { $in: agentesId },
                    // 'activo': activo,
                   // 'situacionLaboral.cargo._id': { $in: cargosId }

                }
            } ,
            {
                $sort: { 'numero': sortOrder }
            }
        ]

        let agentes = await Agente.aggregate(pipeline);
        let legajos = [];
        for (const a of agentes){
            let dir = a.direccion;
            let legajo = {
                header: `${a.apellido}, ${a.nombre}`,
                datos:
                [{
                    subheader: 'Datos Personales',
                    rows: [
                        // Dos columnas por fila
                        { cols: [{ key: 'Numero de Agente:', valor: a.numero             }, { key: 'Estado:', valor: 'Activo' }]},
                        { cols: [{ key: 'Nombre:'          , valor: a.nombre             }, {} ]},
                        { cols: [{ key: 'Documento:'       , valor: a.documento          }, {} ]},
                        { cols: [{ key: 'CUIL:'            , valor: a.cuil               }, {} ]},
                        { cols: [{ key: 'Estado Civil:'    , valor: title(a.estadoCivil) }, { key: 'Nacionalidad:', valor: title(a.nacionalidad, 'nombre')} ]},
                        { cols: [{ key: 'Sexo:'            , valor: title(a.sexo)        }, { key: 'Fecha de Nacimiento:', valor: a.fechaNacimiento } ]},
                    ]
                },

                {
                    subheader: 'Domicilio',
                    rows: [
                        { cols: [{ key: 'Direccion:'        , valor: title(dir.valor) }              , { }]},
                        { cols: [{ key: 'Localidad:'        , valor: title(dir.localidad, 'nombre') }, { key: 'Provincia:', valor: title(dir.localidad.provincia, 'nombre') } ]},
                        { cols: [{ key: 'Barrio:'           , valor: title(dir.barrio) }             , { key: 'CP:', valor: dir.codigoPostal } ]},
                    ]
                }
                ]
            }

            
            legajos.push(legajo)
        }
        return { legajos: legajos }
    }


    

}