import { Types } from 'mongoose';

import { FilesModel } from '../../tm/schemas/imagenes';
import { FileDescriptor, IFileDescriptor, FileDescriptorDocument } from '../schemas/filedescriptor';

import config from '../../../confg';
import * as multer from 'multer';

import FileSystemStorage from '../storage/FileSystemStorage';
import { Readable } from 'stream';
const fs = require('fs');
const path = require('path');

export const storage = FileSystemStorage({ destination: config.app.uploadFilesPath });
export const multerUploader = multer({ storage });


/**
 * Realiza el upload de un archivo (con multer como middleware), y luego crea
 * y almacena en la db un descriptor del mismo. El archivo en esta instancia
 * aun no esta asociado a ningun objeto en la db.
 * El descriptor contendra informacion relevante del archivo que se ha subido.
 * Esta informacion es util posteriormente para realizar busquedas, descargas
 * o borrados.
 * @returns
 */
export async function uploadFile(req, res, next) {
    try {
        const file = req.file;
        const extension = file.originalname.split('.').pop();
        const data: IFileDescriptor = {
            real_id: file.id,
            adapter: file.adapter,
            filename: file.originalname,
            extension,
            mimetype: file.mimetype
        };
        const fd = await FileDescriptor.create(data);
        if (fd) {
            return res.send(fd);
        }
        return next(422);
    } catch (err) {
        return next(err);
    }
}

/**
 * Descarga un archivo previamente 'uploaded' que aun no ha sido asociado a un
 * objeto en la db. Antes de la descarga por lo tanto es necesario recuperar
 * el descriptor del archivo para proveer mas detalles al header del response,
 * por ejemplo, mimetype, filename, etc.
 *
 * @returns
 */
export async function downloadFile(req, res, next) {
    try {
        const id = req.params.id; // id es el id del filedescriptor
        const fd = await _findFileDescriptorBy(id);
        if (fd) {
            const stream = await storage.adapter.read(fd.real_id);
            res.writeHead(200, {
                'Content-Type': fd.mimetype.toString(),
                'Content-Disposition': `attachment; filename=${fd.filename}`
            });
            stream.pipe(res);
        } else {
            return next(404);
        }
    } catch (err) {
        return next(err);
    }
}


/**
 * Elimina un archivo previamente 'uploaded' que aun no ha sido asociado a un
 * objeto en la db.
 *
 * @returns
 */
export async function deleteFile(req, res, next) {
    try {
        const id = req.params.id; // id es el id del filedescriptor
        const fd = await _findFileDescriptorBy(id);
        if (fd) {
            await storage.adapter.delete(fd.real_id);
            return next(200);
        } else {
            return next(404);
        }
    } catch (err) {
        return next({});
    }
}


/**
 * Realiza el upload de un archivo (con multer como middleware), e
 * inmediatamente asocia el archivo a un objeto en la base de datos.
 * Ver diferencia con la funcion uploadFile()
 *
 * @returns
 */
export async function addFile(req, res, next) {
    try {
        const file = req.file;
        const objId = req.params.objId;
        if (!req.file) { return res.status(202).send(); }
        if (!objId || (objId && !Types.ObjectId.isValid(objId))) {
            _removeFilesFromFs([file._id]);
            return next(404);
        }
        const result = await attachFilesToObject([file._id], objId);
        return res.json(result);

    } catch (err) {
        return next(err);
    }
}

export async function attachFiles(req, res, next) {
    try {
        const files = req.body.filesToAttach;
        const objId = req.params.objId;
        if (!objId || (objId && !Types.ObjectId.isValid(objId))) { return next(404); }
        const result = await attachFilesToObject(files, objId);
        return res.json(result);

    } catch (err) {
        return next(err);
    }
}

export async function dettachFiles(req, res, next) {
    try {
        const files = req.body.filesToDettach;
        const objId = req.params.objId;
        if (!objId || (objId && !Types.ObjectId.isValid(objId))) { return next(404); }
        const result = await dettachFilesFromObject(files, objId);
        return res.json(result);

    } catch (err) {
        return next(err);
    }
}


export async function getFiles(req, res, next) {
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) { return next(404); }
        const filesModel = FilesModel();
        const files = await filesModel.find({
            'metadata.objID': new Types.ObjectId(id),
        }).toArray();
        return res.json(files);
    } catch (err) {
        return next(err);
    }
}

export async function readFile(req, res, next) {
    try {
        const id = req.params.id;
        if (!id || (id && !Types.ObjectId.isValid(id))) { return next(404); }
        const filesModel = FilesModel();
        const file = await filesModel.findOne({ _id: new Types.ObjectId(id) });
        if (file) {
            const readStream = filesModel.readFile({ _id: file._id });
            res.contentType(file.contentType);
            return readStream.pipe(res);
        } else {
            return res.send(null);
        }
    } catch (err) {
        console.log('Encontramos un error');
        return next(err);
    }
}


/**
 * Elimina un archivo previamente almacenado y asociado a un objeto.
 *
 * @returns
 */
export async function removeFile(req, res, next) {
    try {
        const objId = req.params.objId;
        const fileId = req.params.fileId;
        if (!objId || (objId && !Types.ObjectId.isValid(objId))) { return res.status(404).send(); }
        if (!fileId || (fileId && !Types.ObjectId.isValid(fileId))) { return res.status(404).send(); }
        await dettachFilesFromObject([fileId], objId);
        return res.status(200).send();
    } catch (err) {
        return next(err);
    }
}

/**
 * Recibe por parametro un listado con los id de los archivos a recuperar
 * del filesystem para guardar posteriormente en la base (monogdb). Se debe
 * proveer un objeto como parametro el cual se utilizara su id para agregar
 * al metadata del archivo guardado.
 * Por defecto luego se eliminan todos los archivos del filesystem que fueron
 * procesados. Este comportamiento se puede modificar con la bandera removeFiles
 *
 * @param {*} files
 * @param {*} obj
 */
export async function attachFilesToObject(fileIds, objectOwnerId, removeFiles = true) {
    let filesD = await _findFileDescriptors(fileIds);
    let results = await Promise.all(
        filesD.map((file) => {
            return _writeFileFromFsToMongo(file, objectOwnerId);
        })
    )
        .then(files => {
            // Se terminaron de procesar todas las promesas. Si corresponde se
            // eliminan los archivos del filesystem recientemente copiados a la db
            // TODO: Habria que analizar si fallo la copia de algun archivo quizas.
            if (removeFiles) {
                _removeFilesFromFs(filesD);
                // TODO: Remove file descriptors!!
            }
            return files;
        })
        .catch(function (err) {
            return [];
        });
    return results;
}

export async function dettachFilesFromObject(fileIds, objID) {
    const filesModel = FilesModel();
    fileIds = fileIds.map(id => id = Types.ObjectId(id));
    const files = await filesModel.find({ _id: { $in: fileIds } }).toArray();
    files.forEach(file => {
        filesModel.unlink(file._id, (error, unlinkedAttachment) => { });
    });
}

/**
 * Identifica los archivos 'pertenecientes' a un objeto (a traves del metadata.objID) y
 * actualiza sus referencias hacia un nuevo objeto. (Es decir los archivos cambian de
 * propietario)
 * @param objID id del objeto anterior
 * @param newObjID id del nuevo objeto
 */
export async function changeFileObjectRef(objID, newObjID) {
    const filesModel = FilesModel();
    const files = await filesModel.find({ 'metadata.objID': new Types.ObjectId(objID) }).toArray();
    for (const f of files) {
        filesModel.update({ _id: f._id },
            { $set: { 'metadata.objID': new Types.ObjectId(newObjID) } });
    }
}

export function _writeFileFromFsToMongo(file: FileDescriptorDocument, objectId): Promise<any> {
    const filesModel = FilesModel();
    return new Promise(async function (resolve, reject) {
        let stream = new Readable();
        const filePath = path.join(config.app.uploadFilesPath, file.real_id);
        stream = fs.createReadStream(filePath);
        stream.on('error', function () {
            resolve({ ok: false, filename: file.filename, _id: file._id });
        });

        const options = ({
            filename: file.filename,
            contentType: file.mimetype,
            metadata: {
                objID: Types.ObjectId(objectId)
            }
        });
        filesModel.writeFile(options, stream, (error, newfile) => {
            if (error) {
                resolve({ ok: false, filename: file.filename, _id: file._id });
            }
            resolve(newfile);
            // resolve({ok:true, filename:file.filename, id:file.id});
        });
    });
}

export async function _removeFilesFromFs(filesToRemove: FileDescriptorDocument[]) {
    filesToRemove.forEach(file => {
        try {
            const filePath = path.join(config.app.uploadFilesPath, file.real_id);
            fs.unlink(filePath, (err) => {
            });
        } catch (err) { } // Ignore errors
    });
}


export async function _findFileDescriptorBy(id) {
    return await FileDescriptor.findById(Types.ObjectId(id));
}

export async function _findFileDescriptors(ids) {
    let objIds = ids.map(id => id = Types.ObjectId(id));
    return await FileDescriptor.find({ _id: { $in: objIds } });
}
