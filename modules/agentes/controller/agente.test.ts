import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as request from 'supertest';
import mockingoose from 'mockingoose';

import { Routes } from '../routes/agente';
import AgenteController from './agente';

const baseUrl = '/api/modules/agentes';
const initAPI = () =>{
    const app = express();
    app.use(bodyParser.json({ limit: '150mb' }));
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(baseUrl, Routes);
    return app;
}

let app = initAPI();

describe('POST /agentes', () => {
    // SI se produjo algun error en el proceso indicar con status 500
    // Si el DNI (combinado con algo?) existe entonces notificar con status y body {}
    // Si falta algun dato obligatorio (definido en el schema) notificar correctamente
    it('Si algo falla al insertar retornar status 500', async () => {
        mockingoose.Agente.toReturn(new Error(), 'save');
        const response = await request(app).post(baseUrl + '/agentes');
        expect(response.status).toBe(500);
    });

    it('Si el body no tiene los atributos obligatorios retornar status 500 y un objeto vacio',
      async () => {
        const _doc = {};
        mockingoose.Agente.toReturn(_doc, 'save');
        const response = await request(app).post(baseUrl + '/agentes');
        expect(JSON.parse(JSON.stringify(response.body))).toMatchObject(_doc);
        expect(response.status).toBe(500);
    })

    it('Si el agente ya existe entonces notificar con status 500 y body {}', async () => {
        let _app = initAPI();
        const body = {
            documento: '28588178',
            cuil: '20285881782',
            nombre: 'Marcos',
            apellido: 'Cisterna'
        };
        const mockCheckExiste = jest.spyOn(AgenteController, "existsAgente");
        mockCheckExiste.mockReturnValue(true);
        mockingoose.Agente.toReturn({}, 'save');
        const response = await request(_app)
            .post(baseUrl + '/agentes')
            .send(body);

        expect(mockCheckExiste).toBeCalled();
        expect(JSON.parse(JSON.stringify(response.body))).toMatchObject({});
        expect(response.status).toBe(500);
    });

    it('Si el agente no existe y todos los datos del body estan bien entonces notificar con status 200 y body {}',
      async () => {
        const _doc = {
            _id: '507f191e810c19729de860eb',
            documento: '28588178',
            cuil: '20285881782',
            nombre: 'Marcos',
            apellido: 'Cisterna'
        };
        const body = {
            documento: '28588178',
            cuil: '20285881782',
            nombre: 'Marcos',
            apellido: 'Cisterna'
        };
        const mockCheckExiste = jest.spyOn(AgenteController, "existsAgente");
        mockCheckExiste.mockReturnValue(false);
        mockingoose.Agente.toReturn(_doc, 'save');
        const response = await request(app)
            .post(baseUrl + '/agentes')
            .send(body);
        expect(mockCheckExiste).toHaveBeenCalled();
        expect(JSON.parse(JSON.stringify(response.body))).toMatchObject(_doc);
        expect(response.status).toBe(200);
    });
})