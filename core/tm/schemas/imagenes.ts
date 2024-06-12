
import * as mongoose from 'mongoose';
// const Grid = require('gridfs-stream');

const { createBucket } = require('mongoose-gridfs');

export function makeFs() {

    const AgentesImagenesSchema = createBucket({
        bucketName: 'imagenesagente',
        mongooseConnection: mongoose.connection
    });
    return AgentesImagenesSchema;
}


export function FilesModel() {
    const FilesSchema = createBucket({
        bucketName: 'files',
        mongooseConnection: mongoose.connection
    });
    return FilesSchema;
}

export function FilesTemporalModel() {
    const FilesSchema = createBucket({
        bucketName: 'filestemporal',
        mongooseConnection: mongoose.connection
    });
    return FilesSchema;
}

// export function GridFS({ host, collectionName = 'filesAgentes' }) {
//     let gfs = Grid()
//     Grid.mongo = mongoose.mongo;

//     let conn = mongoose.createConnection(host);
//     conn.once('open', () => {
//         this.gfs = Grid(conn.db);
//         this.gfs.collection(collectionName);
//     });
