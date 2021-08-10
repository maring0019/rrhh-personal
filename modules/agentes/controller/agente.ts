import { Types } from 'mongoose';
import * as aqp from 'api-query-params';

import { Readable } from 'stream';

import { Agente } from '../schemas/agente';
import { makeFs } from '../../../core/tm/schemas/imagenes';
import { attachFilesToObject } from '../../../core/files/controller/file';
import { AusenciaPeriodo } from '../../ausentismo/schemas/ausenciaperiodo';
import { readImage } from '../../../core/files/utils';
import { IndicadorAusentismo } from '../../ausentismo/schemas/indicador';
import { NormaLegal } from '../schemas/normaLegal';
import { Nota } from '../../notas/schemas/nota';
import { Adjunto } from '../../adjuntos/schemas/adjunto';

import { fichador } from './fichador';
import { EventCore } from '@andes/event-bus';


class FichadorException extends Error { }

async function getAgentes(req, res, next) {
    return await searchAgentes(req, res, next);
    // try {
    //     let query = Agente.find({});
    //     if (req.query.nombre) {
    //         query
    //             .where("nombre")
    //             .equals(RegExp("^.*" + req.query.nombre + ".*$", "i"));
    //     }
    //     if (req.query.numero) {
    //         query.where({ numero: req.query.numero });
    //     }

    //     let agentes = await query.sort({ nombre: 1 }).exec();
    //     return res.json(agentes);
    // } catch (err) {
    //     return next(err);
    // }
}

// TODO Implementar testing
async function getAgenteByID(req, res, next) {
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) { return next(404); }
        let agente: any = await Agente.findById(id);
        if (!agente) { return next(404); }
        let foto = await AgenteController._findFotoPerfil(id);
        const fotoModel = makeFs();
        if (foto) {
            fotoModel.readFile({ _id: foto._id }, (err, buffer) => {
                if (err) {
                    return res.json(agente);
                }
                agente.foto = buffer.toString('base64');
                return res.json(agente);
            });
        } else {
            return res.json(agente);
        }
    } catch (err) {
        return next(err);
    }
}

async function searchAgentes(req, res, next) {
    try {
        const params = aqp(req.query);
        let agentes = await Agente.find(params.filter).sort({
            activo: -1,
            apellido: 1,
        });
        return res.json(agentes);
    } catch (err) {
        return next(err);
    }
}

async function addAgente(req, res, next) {
    try {
        let historiaLaboral = [];
        let situacionLaboral = { ...req.body.situacionLaboral };
        if (req.body.migracion) {
            // Si viene este dato asumimos que es de la migracion y
            // lo guardamos como viene al dato
            historiaLaboral = req.body.historiaLaboral;
        } else {
            // Sino viene el dato, se trata de un alta en el nuevo
            // sistema. La situacion laboral la marcamos como alta
            // Este dato será util al momento de cargar una nueva
            // historia laboral.
            situacionLaboral.esAlta = true;
            situacionLaboral.fecha =
                situacionLaboral.normaLegal &&
                    situacionLaboral.normaLegal.fechaNormaLegal
                    ? situacionLaboral.normaLegal.fechaNormaLegal
                    : new Date();
        }
        let agente: any = new Agente({
            idLegacy: req.body.idLegacy,
            numero: req.body.numero,
            // tipoDocumento
            documento: req.body.documento,
            cuil: req.body.cuil,
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            estadoCivil: req.body.estadoCivil,
            sexo: req.body.sexo,
            genero: req.body.genero,
            fechaNacimiento: req.body.fechaNacimiento,
            nacionalidad: req.body.nacionalidad,
            direccion: req.body.direccion,
            contactos: req.body.contactos,
            educacion: req.body.educacion,
            situacionLaboral,
            historiaLaboral,
            bajas: req.body.bajas,
            activo:
                req.body.activo == null || req.body.activo === 'undefined'
                    ? true
                    : req.body.activo,
        });
        // Con el objetivo de facilitar el testing de funciones que invocan
        // otras funciones internas dentro del mismo modulo es que se realiza
        // la llamada a _findAgente de la siguiente manera
        // https://github.com/facebook/jest/issues/936
        // https://medium.com/@qjli/how-to-mock-specific-module-function-in-jest-715e39a391f4
        // https://medium.com/@DavideRama/mock-spy-exported-functions-within-a-single-module-in-jest-cdf2b61af642
        const agenteExistente = await AgenteController._findAgente(agente);
        if (!_isEmpty(agenteExistente)) { return next('El agente ingresado ya existe!'); }

        if (agente.numero && agente.numero.length > 0) {

            // Primero insertamos el agente en el SQLServer Legacy
            const agenteSQLServerID = await fichador.insertAgente(agente);
            // TODO Validar el objeto retornado por insertAgente. Definir que hacer si no se puede insertar
            if (!agenteSQLServerID) { return next('El agente ingresado no se pudo dar de alta!'); }
            // Asignamos el numero generado por SQLServer al agente e insertamos en mongoDB
            agente.idLegacy = agenteSQLServerID;
        }


        const agenteNuevo = await agente.save();
        if (req.body.foto) {
            await AgenteController._saveImage(
                req.body.foto,
                agenteNuevo._id,
                req.body.migracion
            );
        }

        EventCore.emitAsync('agentes:create', agenteNuevo);

        return res.json(agenteNuevo);


    } catch (err) {
        return next(err);
    }
}

function updateField(obj, keys: string[], value) {
    try {
        if (keys.length === 1) {
            obj[keys[0]] = value;
        } else {
            const key = keys.shift();
            // TODO Validar que la llave exista en el objeto
            updateField(obj[key], keys, value);
        }
    } catch (err) {
        console.log(err);
    }
}

/**
 * TODO Doc this
 * @param req
 * @param res
 * @param next
 */
async function updateAgente(req, res, next) {
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) {
            return res.status(404).send({ message: 'Agente no encontrado.' });
        }

        let agente: any = await Agente.findById(id);
        if (!agente) {
            return res.status(404).send({ message: 'Agente no encontrado.' });
        }

        let objWithChanges = req.body;
        // Update only changed fields. This way, audit module only audits
        // changed fields correctly
        for (const key of Object.keys(objWithChanges)) {
            let keys = key.split('.');
            updateField(agente, keys, objWithChanges[key]);
        }
        await agente.updateOne(agente);
        return res.json(agente);
    } catch (err) {
        return next(err);
    }
}

async function deleteAgente(req, res, next) {
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) {
            return res.status(404).send();
        }
        let situacion: any = await Agente.findById(id);
        if (!situacion) { return res.status(404).send({ message: 'Not found' }); }
        const situacionEliminada = await situacion.remove();
        return res.json(situacionEliminada);
    } catch (err) {
        return next(err);
    }
}

async function bajaAgente(req, res, next) {
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) {
            return res.status(404).send();
        }
        let agente: any = await Agente.findById(id);
        if (!agente) {
            return res.status(404).send({ message: 'Agente not found' });
        }
        let baja = req.body;
        // Comenzamos a aplicar los cambios
        agente.activo = false;

        // Guardamos la ultima situacion laboral en el historial.
        moveSituacionLaboralToHistorial(agente);

        // Forzamos la creacion de la Norma Legal con un id valido
        // ya que necesitamos este dato para posteriormente asociar
        // los documentos de la misma
        baja.normaLegal = new NormaLegal(baja.normaLegal);

        // Datos de la baja para el historial
        let nuevaHistoria = {
            tipo: 'baja',
            timestamp: new Date(),
            changeset: baja,
        };
        agente.historiaLaboral.unshift(nuevaHistoria);
        let agenteActualizado = await agente.save();

        await fichador.bajaUsuario(agente);

        return res.json(agenteActualizado);
    } catch (err) {
        return next(err);
    }
}

async function reactivarAgente(req, res, next) {
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) {
            return res.status(404).send();
        }

        let agente: any = await Agente.findById(id);
        if (!agente) {
            return res.status(404).send({ message: 'Agente not found' });
        }

        const reactivacion = req.body;
        if (
            !reactivacion ||
            !reactivacion.cargo ||
            !reactivacion.situacion ||
            !reactivacion.regimen
        ) {
            return res.status(400).send({
                message: `Se requiere especificar la nueva Situacion Laboral
                          del Agente para su correcta reactivación`,
            });
        }
        // Si llegamos hasta aqui entonces estan dadas todas condiciones
        // para reactivar al agente
        agente.activo = true;
        agente.situacionLaboral.fecha = reactivacion.fecha;
        agente.situacionLaboral.motivo = 'Reactivación'; // Hardcodeamos el motivo
        agente.situacionLaboral.normaLegal = reactivacion.normaLegal || null;
        agente.situacionLaboral.situacion = reactivacion.situacion;
        agente.situacionLaboral.cargo = reactivacion.cargo;
        agente.situacionLaboral.regimen = reactivacion.regimen;
        let agenteActualizado = await agente.save();
        return res.json(agenteActualizado);
    } catch (err) {
        return next(err);
    }
}

async function generateLegacyID() {
    let results: any = await Agente.aggregate([
        { $sort: { codigoFichado: -1 } },
        { $limit: 1 }
    ]);

    if (results && results.length === 1) {
        return (results[0].codigoFichado || 50600) + 1;
    }
    throw new FichadorException(`No se pudo obtener un id valido para fichar`);
}


async function consultaFichadoAgente(req, res, next) {
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) {
            return res.status(404).send({ message: 'Agente ID inválido' });
        }

        let agente: any = await Agente.findById(id);
        if (!agente) {
            return res.status(404).send({ message: 'Agente not found' });
        }

        if (!agente.idLegacy) { return res.status(200).send({ status: false }); }

        const userFichador = await fichador.findUsuario(agente.idLegacy);
        if (userFichador && userFichador.Deptid !== 6) {
            return res.status(200).send({ status: true });
        } else {
            return res.status(200).send({ status: false });
        }
    } catch (err) {
        return next(err);
    }
}

async function inhabilitaFichadoAgente(req, res, next) {
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) {
            return res.status(404).send({ message: 'Agente ID inválido' });
        }

        let agente: any = await Agente.findById(id);
        if (!agente) {
            return res.status(404).send({ message: 'Agente not found' });
        }


        if (agente.idLegacy) {
            const userFichador = await fichador.findUsuario(agente.idLegacy);
            if (userFichador) {
                await fichador.inhabilitaUsuario(userFichador.Userid);
            }
        }

        return res.status(200).send({});
    } catch (err) {
        return next(err);
    }
}

async function habilitaFichadoAgente(req, res, next) {
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) {
            return res.status(404).send({ message: 'Agente ID inválido' });
        }

        let agente: any = await Agente.findById(id);
        if (!agente) {
            return res.status(404).send({ message: 'Agente not found' });
        }

        if (!agente.codigoFichado) {
            agente.codigoFichado = await generateLegacyID();
            await agente.save();
            await fichador.habilitaUsuario(agente);
        }

        await fichador.fichadorUpdateUsuarioStatus(agente.idLegacy, 7);

        // const userFichador = await fichador.findUsuario(agente.idLegacy);
        // userFichador
        //     ? await fichador.habilitaUsuario(userFichador.Userid)
        //     : await fichador.addUsuario(agente);

        return res.status(200).send({});
    } catch (err) {
        return next(err);
    }
}

/**
 * Incorpora una nueva historia laboral, lo cual implica actualizar la
 * situacion laboral actual con la nueva historia laboral y guardar un
 * registro de la antigua situacion.
 * @param req
 * @param res
 * @param next
 */
async function addHistoriaLaboral(req, res, next) {
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) {
            return res.status(404).send();
        }

        let agente: any = await Agente.findById(id);
        if (!agente) {
            return res.status(404).send({ message: 'Agente not found' });
        }
        let newSituacionLaboral = req.body;
        moveSituacionLaboralToHistorial(agente);
        replaceSituacionLaboral(agente, newSituacionLaboral);
        let agenteActualizado = await agente.save();
        return res.json(agenteActualizado);
    } catch (err) {
        return next(err);
    }
}

async function updateHistoriaLaboral(req, res, next) {
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) {
            return res.status(404).send();
        }

        let agente: any = await Agente.findById(id);
        if (!agente) {
            return res.status(404).send({ message: 'Agente not found' });
        }

        let historia = req.body;
        const idx = agente.historiaLaboral.findIndex(
            (obj) => obj._id === historia._id
        );
        if (idx < 0) {
            return res.status(404).send({ message: 'Historia not found' });
        }

        // Si la norma legal no tiene id forzamos la creacion ya que
        // es necesario para asociarle los documentos adjuntos.
        // La falta de id es un problema que se arrastra de la migracion
        if (!historia.changeset.normaLegal._id) {
            historia.changeset.normaLegal = new NormaLegal(
                historia.changeset.normaLegal
            );
        }
        agente.historiaLaboral[idx] = historia;
        let agenteActualizado = await agente.save();
        return res.json(agenteActualizado);
    } catch (err) {
        return next(err);
    }
}

async function deleteHistoriaLaboral(req, res, next) {
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) {
            return res.status(404).send();
        }

        let agente: any = await Agente.findById(id);
        if (!agente) {
            return res.status(404).send({ message: 'Agente not found' });
        }

        let historia = req.body;
        const idx = agente.historiaLaboral.findIndex(
            (obj) => obj._id === historia._id
        );
        if (idx < 0) {
            return res.status(404).send({ message: 'Historia not found' });
        }

        agente.historiaLaboral.splice(idx, 1);
        let agenteActualizado = await agente.save();
        return res.json(agenteActualizado);
    } catch (err) {
        return next(err);
    }
}

/**
 * Mueve los datos de la situacion laboral modificada al historial
 * del agente.
 * @param agente
 * @param newSituacionLaboral
 */
function moveSituacionLaboralToHistorial(agente) {
    let agenteCopy = agente.toObject();
    let oldSituacionLaboral = agenteCopy.situacionLaboral;
    let nuevaHistoria = {
        tipo: oldSituacionLaboral.esAlta ? 'alta' : 'modificacion',
        timestamp: new Date(),
        changeset: { ...oldSituacionLaboral },
    };
    agente.historiaLaboral.unshift(nuevaHistoria);
}

/**
 * Actualiza la situacion laboral actual con los datos de la nueva situacion.
 * @param agente
 * @param newSituacionLaboral
 */
function replaceSituacionLaboral(agente, newSituacionLaboral) {
    // Recordar que los datos siguientes son para utilizar en el
    // futuro para almacenarse como parte de la historia cuando
    // se vuelva a modificar la situacion del agente por una nueva
    agente.situacionLaboral.fecha = newSituacionLaboral.fecha;
    agente.situacionLaboral.motivo = newSituacionLaboral.motivo;
    agente.situacionLaboral.esAlta = false;

    // Datos de la nueva situacion laboral del agente
    agente.situacionLaboral.normaLegal = newSituacionLaboral.normaLegal;
    agente.situacionLaboral.situacion = newSituacionLaboral.situacion;
    agente.situacionLaboral.cargo = newSituacionLaboral.cargo;
    agente.situacionLaboral.regimen = newSituacionLaboral.regimen;
}

async function uploadFotoPerfil(req, res, next) {
    try {
        const id = req.params.id;
        const imagen = req.body.imagen;
        if (!id || (id && !Types.ObjectId.isValid(id))) {
            return res.status(404).send();
        }
        if (!imagen) { return res.status(200).send(); }
        await AgenteController._saveImage(imagen, Types.ObjectId(id));
        return res.status(200).send();
    } catch (err) {
        return next(err);
    }
}

async function getFotoPerfil(req, res, next) {
    const id = req.params.id;
    const queryParams = req.query;
    const foto = await AgenteController._findFotoPerfil(id);
    const fotoModel = makeFs();
    if (foto) {
        if (queryParams && queryParams.attachment) {

            fotoModel.readFile({ _id: foto._id }, async (err, buffer) => {
                try {
                    if (err) { throw err; }
                    res.setHeader('Content-Type', foto.contentType);
                    res.setHeader('Content-Length', foto.length);
                    res.setHeader(
                        'Content-Disposition',
                        `attachment; filename=${foto.filename}`
                    );
                    return res.send(buffer);
                } catch (err) {
                    console.log('Encontramos un error'); // TODO Procesar correctamente
                    return next(err);
                }
            });
        } else {
            fotoModel.readFile({ _id: foto._id }, (err, buffer) => {
                if (err) {
                    console.log('ERROR!!');
                    return next(err);
                } else {
                    res.setHeader('Content-Type', foto.contentType);
                    res.setHeader('Content-Length', foto.length);
                    return res.send(buffer.toString('base64'));
                }
            });
        }
    } else {
        return res.send(null);
    }
}

async function getAusencias(req, res, next) {
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) { return next(404); }
        let agente: any = await Agente.findById(id);
        if (!agente) { return next(404); }

        const pipeline = [
            { $match: { 'agente._id': Types.ObjectId(agente._id) } },
            { $unwind: '$ausencias' },
        ];
        let ausencias = await AusenciaPeriodo.aggregate(pipeline);
        return res.json(ausencias);
    } catch (err) {
        return next(err);
    }
}

async function getNotas(req, res, next) {
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) { return next(404); }
        let agente: any = await Agente.findById(id);
        if (!agente) { return next(404); }

        const pipeline = [
            { $match: { 'agente._id': Types.ObjectId(agente._id) } },
            { $sort: { fecha: -1 } },
        ];
        let notas = await Nota.aggregate(pipeline);
        return res.json(notas);
    } catch (err) {
        return next(err);
    }
}

async function getAdjuntos(req, res, next) {
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) { return next(404); }
        let agente: any = await Agente.findById(id);
        if (!agente) { return next(404); }

        const pipeline = [
            { $match: { 'object._id': Types.ObjectId(agente._id) } },
            { $sort: { fecha: -1 } },
        ];
        let adjuntos = await Adjunto.aggregate(pipeline);
        return res.json(adjuntos);
    } catch (err) {
        return next(err);
    }
}

async function getAusenciasAsEvento(req, res, next) {
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) { return next(404); }
        let agente: any = await Agente.findById(id);
        if (!agente) { return next(404); }

        // TODO: Aplicar algun filtro por anio o similar. Ahora por defecto
        // recupera la info en un periodo de un anio hacia atras y adelante
        const thisYear = new Date().getFullYear();
        const fechaHastaMax = new Date(thisYear + 1 + '-12-31');
        const fechaDesdeMin = new Date(thisYear - 5 + '-01-01');
        let matchFecha: any = {
            fechaHasta: { $gt: fechaDesdeMin },
            fechaDesde: { $lt: fechaHastaMax },
        };

        const pipeline = [
            {
                $match: {
                    ...{ 'agente._id': Types.ObjectId(agente._id) },
                    ...matchFecha,
                },
            },
            { $unwind: '$ausencias' },
            {
                $project: {
                    _id: '$_id',
                    title: '$articulo.codigo',
                    start: {
                        $dateToString: {
                            date: '$ausencias.fecha',
                            format: '%Y-%m-%d',
                        },
                    },
                    allDay: { $literal: true },
                    backgroundColor: 'transparent',
                    textColor: { $ifNull: ['$articulo.color', '#00A8E0'] },
                    className: 'ausencia-event-class',
                    type: 'AUSENCIA',
                    ausentismoFechaDesde: {
                        $dateToString: {
                            date: '$fechaDesde',
                            format: '%Y-%m-%dT00:00:00',
                        },
                    },
                    ausentismoFechaHasta: {
                        $dateToString: {
                            date: '$fechaHasta',
                            format: '%Y-%m-%dT00:00:00',
                        },
                    },
                    startString: {
                        $dateToString: {
                            date: '$ausencias.fecha',
                            format: '%Y-%m-%dT00:00:00',
                        },
                    },
                },
            },
        ];
        let ausencias = await AusenciaPeriodo.aggregate(pipeline);
        return res.json(ausencias);
    } catch (err) {
        return next(err);
    }
}

async function getLicenciasTotales(req, res, next) {
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) { return next(404); }

        let agente: any = await Agente.findById(id);
        if (!agente) { return next(404); }

        const thisYear = new Date().getFullYear();
        const pipeline = [
            {
                $match: {
                    'agente._id': Types.ObjectId(agente._id),
                    vigencia: { $gte: thisYear - 2 },
                },
            },
            { $unwind: '$intervalos' },
            { $match: { 'intervalos.totales': { $nin: [null, ''] } } },
            {
                $group: {
                    _id: null,
                    totales: { $sum: '$intervalos.totales' },
                    ejecutadas: { $sum: '$intervalos.ejecutadas' },
                },
            },
        ];
        let licenciasTotales = await IndicadorAusentismo.aggregate(pipeline);
        return res.json(licenciasTotales);
    } catch (err) {
        return next(err);
    }
}

/**
 * Valida que un agente tenga todos los atributos requeridos
 * Si falta algun atributo o valor, retorna un array con el/los nombre/s del
 * atributo faltante, caso contrario si esta todo ok, retorna un array vacio
 * @param agente obj a validar
 */
function _validateAgenteAttributes(agente): String[] {
    let objToCheck = agente;
    const attrRequeridos = ['documento', 'nombre', 'apellido', 'sexo'];
    let attrFaltantes = [];
    if (agente.hasOwnProperty('_doc')) {
        objToCheck = agente._doc;
    }
    attrRequeridos.forEach((e) => {
        if (!objToCheck.hasOwnProperty(e)) {
            attrFaltantes.push(e);
        } else {
            if (typeof objToCheck[e] === 'undefined' || !objToCheck[e]) {
                attrFaltantes.push(e);
            }
        }
    });
    return attrFaltantes;
}

/**
 * Realiza la busqueda de un agente específico. Basicamente determina la
 * existencia del mismo o no en la db. El agente que se proporciona como
 * parametro debe tener todos los atributos obligatorios para poder luego
 * determinar con precision si existe el agente. Si no se proveen todos
 * los atributos se arroja una excepcion indicando los atributos faltantes
 *
 * @param agente obj a determinar su existencia
 */
async function _findAgente(agente): Promise<any> {
    const attrFaltantes = AgenteController._validateAgenteAttributes(agente);
    if (attrFaltantes.length > 0) {
        throw new Error(
            `Error: Faltan atributos requeridos. Verifique: ${attrFaltantes.join(
                ', '
            )}`
        );
    }
    try {
        let query = Agente.findOne({
            documento: agente.documento,
            nombre: agente.nombre,
            apellido: agente.apellido,
        });
        const agentes = await query.exec();
        return agentes;
    } catch (err) {
        throw err;
    }
}

function _isEmpty(obj) {
    return obj === null || undefined
        ? true
        : (() => {
            for (const prop in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                    return false;
                }
            }
            return true;
        })();
}

async function _findFotoPerfil(agenteID) {
    if (agenteID) {
        const fotoAgenteModel = makeFs();
        const fotos = await fotoAgenteModel.findOne({
            'metadata.agenteID': new Types.ObjectId(agenteID)
        });
        if (fotos) { return fotos; }
    }
    return null;
}

async function _saveImage(imagen, agenteID, migracion?) {
    // Se eliminan las fotos anteriores si es necesario
    const agenteFotoModel = makeFs();
    const fotosPrevias = await agenteFotoModel.find({
        'metadata.agenteID': agenteID,
    });
    fotosPrevias.forEach((foto) => {
        agenteFotoModel.unlink(foto._id, (error, unlinkedAttachment) => { });
    });
    // Remove extra data if necesary. En la migracion no es necesario este pre-procesamiento
    if (!migracion) {
        imagen = imagen
            .toString()
            .replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
    }

    let buffer = Buffer.from(imagen, 'base64');
    buffer = await readImage(buffer, { quality: 90, w: 256 });
    let stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    const options = {
        filename: 'fotoCredencialNueva.jpg',
        contentType: 'image/jpg',
        metadata: {
            agenteID,
        },
    };
    agenteFotoModel.writeFile(options, stream, (error, file) => { });
}

async function uploadFilesAgente(req, res, next) {
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) { return next(404); }
        let agente: any = await Agente.findById(id);
        if (!agente) { return next(404); }
        const result = await attachFilesToObject([], agente);
        return res.json(result);
    } catch (err) {
        console.log('Estamos atrapando el error!!');
        return next(err);
    }
}

export const AgenteController = {
    getAgentes,
    addAgente,
    bajaAgente,
    reactivarAgente,
    habilitaFichadoAgente,
    inhabilitaFichadoAgente,
    consultaFichadoAgente,
    addHistoriaLaboral,
    updateHistoriaLaboral,
    deleteHistoriaLaboral,
    updateAgente,
    deleteAgente,
    searchAgentes,
    getAgenteByID,
    getFotoPerfil,
    getAusencias,
    getAusenciasAsEvento,
    getLicenciasTotales,
    getNotas,
    getAdjuntos,
    uploadFotoPerfil,
    uploadFilesAgente,
    _findFotoPerfil,
    _findAgente,
    _saveImage,
    _validateAgenteAttributes,
    _isEmpty,
};

// export default AgenteController;
