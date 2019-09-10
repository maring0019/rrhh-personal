
import * as mongoose from 'mongoose';
// const Grid = require('gridfs-stream');

const gridfs = require('mongoose-gridfs');

export function makeFs() {
    const AgentesImagenesSchema = gridfs({
        collection: 'imagenesagente',
        model: 'AgentesImagenes',
        mongooseConnection: mongoose.connection
    });
  
    return AgentesImagenesSchema.model;
}


export function FilesModel() {
    const FilesSchema = gridfs({
        collection: 'files',
        model: 'Files',
        mongooseConnection: mongoose.connection
    });
    return FilesSchema.model;
}

export function FilesTemporalModel() {
    const FilesSchema = gridfs({
        collection: 'filestemporal',
        model: 'Files',
        mongooseConnection: mongoose.connection
    });
    return FilesSchema.model;
}

// export function GridFS({ host, collectionName = 'filesAgentes' }) {
//     let gfs = Grid()
//     Grid.mongo = mongoose.mongo;

//     let conn = mongoose.createConnection(host);
//     conn.once('open', () => {
//         this.gfs = Grid(conn.db);
//         this.gfs.collection(collectionName);
//     });
