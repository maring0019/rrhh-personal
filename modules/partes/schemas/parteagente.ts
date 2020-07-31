import { Schema, Types, model } from 'mongoose';
const audit = require('../../../packages/mongoose-audit-trail');

export const ParteAgenteSchema = new Schema({
    parte: {
        _id: {
            type: Types.ObjectId,
            required: true,
            index: true
        }
    },
    agente: {
        _id: {
            type: Types.ObjectId,
            required: true,
            index: true
        },
        nombre: String, 
        apellido: String
    },
    fecha:{
        type: Date,
        index: true
    },
    fichadas: {
        entrada: Date,
        salida: Date,
        horasTrabajadas: String,
    },
    ausencia: {
        articulo: { 
            _id: Types.ObjectId,
            codigo: String,
            descripcion: String
        }
    },
    justificacion: {
        _id: Types.ObjectId,
        nombre: String
    },
    observaciones: String
});


ParteAgenteSchema.methods.hasNovedades = function(cb) {
    
    let parte = this.toObject(); // Sin esta 'transformacion' no me funcionan las condiciones!
    if (!parte.fichadas && !parte.ausencia &&
        parte.justificacion && parte.justificacion.nombre != "Sin novedad"){
            // console.log('Condicion 1')
            return true;  
        }
    if (!parte.fichadas && parte.ausencia &&
        parte.justificacion && parte.justificacion.nombre == "Inasistencia justificada"){
            // console.log('Condicion 2')
            return true;
        } 
    if (parte.fichadas && (!parte.fichadas.entrada || !parte.fichadas.salida) &&
        parte.justificacion && (parte.justificacion.nombre == "Presente" ||
            parte.justificacion.nombre == "Cumplió jornada laboral")
        ){
            // console.log('Condicion 3')
            return true;
        }
    // console.log("Condicion 4")
    return false;
    
  };

ParteAgenteSchema.plugin(audit.plugin, { omit: ["_id", "id"] })

export const ParteAgente = model('ParteAgente', ParteAgenteSchema, 'partesagentes');