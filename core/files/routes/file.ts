import * as express from 'express';

import * as FileController from '../controller/file';

export const Routes = express.Router();


Routes.post('/upload', FileController.multerUploader.single('archivo'), FileController.uploadFile);
Routes.get('/:id/download', FileController.downloadFile);
Routes.delete('/:id/delete', FileController.deleteFile);

Routes.post('/objects/:id/upload', FileController.multerUploader.single('archivo'), FileController.addFile);
Routes.get('/:fileId/objects/:objId/download', FileController.readFile);
Routes.delete('/:fileId/objects/:objId/delete', FileController.removeFile);

