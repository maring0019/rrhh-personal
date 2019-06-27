import { Types } from 'mongoose';

import { FilesModel } from  '../../tm/schemas/imagenes';
import { FileDescriptor, IFileDescriptor, FileDescriptorDocument } from '../schemas/filedescriptor';
import * as config from '../../../config';
import * as multer from 'multer';
import FileSystemStorage from '../storage/FileSystemStorage'

const fs = require('fs');
const path = require('path');

export const storage = FileSystemStorage({ destination: config.uploadFilesPath });
export const multerUploader = multer({ storage: storage });


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
export async function addFile(req, res, next){
    try {
        const file = req.file;
        const objId = req.params.objId;
        if (!req.file) return res.status(202).send();
        if (!objId || (objId && !Types.ObjectId.isValid(objId))){
            _removeFilesFromFs([file.id]);
            return next(404);
        }
        const result = await attachFilesToObject([file.id], objId);
        return res.json(result);
        
    } catch (err) {
        return next(err);
    }
}

export async function readFile(req, res, next){

}


/**
 * Elimina un archivo previamente almacenado y asociado a un objeto.
 *
 * @returns
 */
export async function removeFile(req, res, next){
    try {
        const objId = req.params.objId;
        const fileId = req.params.fileId;
        if (!objId || (objId && !Types.ObjectId.isValid(objId))) return res.status(404).send();
        if (!fileId || (fileId && !Types.ObjectId.isValid(fileId))) return res.status(404).send();
        await dettachFileFromObject([fileId], objId)
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
export async function attachFilesToObject(fileIds, obj, removeFiles=true){
    let files = await _findFileDescriptors(fileIds);
    Promise.all(
        files.map((file) => {
            _writeFileFromFsToMongo(file, obj._id);
        })
    )
    .then(function(files:any) {
        // Se terminaron de procesar todas las promesas. Si corresponde se
        // eliminan los archivos del filesystem recientemente copiados a la db
        if (removeFiles){
            _removeFilesFromFs(files);
        }
        return files;
    })
    .catch(function(err) {
        return [];
    });
}

export async function dettachFileFromObject(fileIds, objID){
    const filesModel = FilesModel();
    const files = await filesModel.find({ 'id': { $in: fileIds , 'metadata.objectId': objID } });
    files.forEach(file => {
        file.unlinkById(file._id, (error, unlinkedAttachment) => { });
    });
}

export function _writeFileFromFsToMongo(file:FileDescriptorDocument, objectId){
    const filesModel = FilesModel();
    return new Promise(function(resolve, reject) {
        let stream = fs.createReadStream(path.join(config.uploadFilesPath, file.id));
        stream.on('error', function(){ 
            resolve({ok:false, filename:file.filename, id:file.id}) 
        });

        const options = ({
            filename: file.filename,
            contentType: file.mimetype,
            metadata: {
                objID: objectId
            }
        });
        filesModel.write(options, stream, (error, newfile) => {
            if (error) return resolve({ok:false, filename:file.filename, id:file.id});
            return resolve({ok:true, filename:file.filename, id:file.id});
        });
    })
}

export async function _removeFilesFromFs(filesToRemove){
    filesToRemove.forEach(file => {
        try{
            const filePath = path.join(config.uploadFilesPath, file.id);
            fs.unlink(filePath, (err) => {
            });
        }
        catch (err){} // Ignore errors
    });
}


export async function _findFileDescriptorBy(id) {
    return await FileDescriptor.findById(id);
}

export async function _findFileDescriptors(ids) {
    return await FileDescriptor.find({ 'id': { $in: ids } });
}



// files = [{ 
//     fieldname: 'archivos',
//     filename: 'marianarrhh.jpg',
//     encoding: '7bit',
//     mimetype: 'image/jpeg',
//     id: '5d0ba74f9b178e27d8b6a57b',
//     adapter: 'file-adapter' },
// { 
//     fieldname: 'archivos',
//     filename: 'foto.jpg',
//     encoding: '7bit',
//     mimetype: 'image/jpeg',
//     id: '5d0ba87a8aba104e7cba0f7f',
//     adapter: 'file-adapter' },
// {
//     fieldname: 'archivos',
//     filename: 'otro_archivo.pdf',
//     encoding: '7bit',
//     mimetype: 'application/pdf',
//     id: '5d0ba74f9b178e27d8b6a57c',
//     adapter: 'file-adapter' }]