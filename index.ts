require('dotenv').config();

import * as express from 'express';
import * as debug from 'debug';
import { initAPI } from './initialize';
import config from './confg';

// Inicializa express
const app = express();
initAPI(app);

// Inicia el servidor HTTP
const port = config.app.port;
app.listen(port, () => debug('andes')('listening on port %s', port));
