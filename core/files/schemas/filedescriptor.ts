import { Model, model, Document, Schema } from 'mongoose';

export interface IFileDescriptor {
    adapter?: string;
    real_id?: string;
    mimetype: string;
    filename: string;
    extension: string;
}

export interface FileDescriptorDocument extends Document, IFileDescriptor {}

export let FileDescriptorSchema: Schema = new Schema({
    adapter: String,
    real_id: String,
    mimetype: String,
    extension: String,
    filename: String
});

export let FileDescriptor: Model<FileDescriptorDocument> = model('FileDescriptor', FileDescriptorSchema, 'fileDescriptors');
