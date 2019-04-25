
import * as mongoose from 'mongoose';
const gridfs = require('mongoose-gridfs');

export function makeFs() {
    const AgentesImagenesSchema = gridfs({
        collection: 'AgentesImagenes',
        model: 'AgentesImagenes',
        mongooseConnection: mongoose.connection
    });
  
    return AgentesImagenesSchema.model;
}
