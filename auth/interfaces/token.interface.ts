import * as mongoose from 'mongoose';

export interface Token {
    id: mongoose.Types.ObjectId;
    // permisos: string[];
    type: string;
}
