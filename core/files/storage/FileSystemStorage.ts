
import { FileAdapter } from './adapters/FileAdapter';

function AdapterStorage(opts) {
    this.folder = (opts.destination || 'uploads');
    this.adapter = new FileAdapter({ folder: this.folder });
}

AdapterStorage.prototype._handleFile = function _handleFile(req, file, cb) {
    this.adapter.write(file.stream).then(id => {
        cb(null, { id, adapter: this.adapter.name });
    });
};

AdapterStorage.prototype._removeFile = function _removeFile(req, file, cb) {
    cb(null, true);
};

export default (opts) => {
    return new AdapterStorage(opts);
};