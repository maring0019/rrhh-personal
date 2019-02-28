import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as request from 'supertest';
import mockingoose from 'mockingoose';

import { Routes } from '../routes/situacion';


const baseUrl = '/api/core/tm';
const initAPI = () =>{
    const app = express();
    app.use(bodyParser.json({ limit: '150mb' }));
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(baseUrl, Routes);
    return app;
}

let app = initAPI()

describe('GET /situaciones', () => {
    const _docs =[ 
        {
            _id: '507f191e810c19729de860ea',
            nombre: 'Contratado',
            requiereVencimiento: true
        },
        {
            _id: '507f191e810c19729de860eb',
            nombre: 'Permanente',
        }];

    it('Si no tiene parametros de busqueda retornamos todos los elementos y un status 200', async () => {
        mockingoose.Situacion.toReturn(_docs, 'find'); 
        const response = await request(app).get(baseUrl + '/situaciones');
        expect(JSON.parse(JSON.stringify(response.body))).toMatchObject(_docs);
        expect(response.status).toBe(200);
    });

    it('Si tiene parametros de busqueda validamos que se apliquen ', async () => {
        const expectedResults = [_docs[1]];
        mockingoose.Situacion.toReturn(expectedResults, 'find');
        const response = await request(app).get(baseUrl + '/situaciones?nombre=Permanente');
        // [TODO] Validar que se aplique el parametro de busqueda a la consulta
        expect(JSON.parse(JSON.stringify(response.body))).toMatchObject(expectedResults);
        expect(response.status).toBe(200);
    });

    it('Si algo falla en la consulta retornar status 500', async () => {
        mockingoose.Situacion.toReturn(new Error(), 'find');
        const response = await request(app).get(baseUrl + '/situaciones');
        expect(response.status).toBe(500);
    });
})


describe('POST /situaciones', () => {
    it('Si algo falla al insertar retornar status 500', async () => {
        mockingoose.Situacion.toReturn(new Error(), 'save');
        const response = await request(app).post(baseUrl + '/situaciones');
        expect(response.status).toBe(500);
    });

    it('Si el body no tiene el atributo nombre retornar status 500 y un objeto vacio', async () => {
        const _doc = {};
        mockingoose.Situacion.toReturn(_doc, 'save');
        const response = await request(app)
            .post(baseUrl + '/situaciones');
        expect(JSON.parse(JSON.stringify(response.body))).toMatchObject(_doc);
        expect(response.status).toBe(500);
    })

    it('Si el body tiene el atributo nombre retornar status 200 y el objeto creado con los valores del body', 
        async () => {
            const _doc = {
                nombre: 'Contratado',
                requiereVencimiento: true
            };
            mockingoose.Situacion.toReturn(_doc, 'save'); 
            const response = await request(app)
                .post(baseUrl + '/situaciones')
                .send(_doc); // body del POST
            expect(JSON.parse(JSON.stringify(response.body))).toMatchObject(_doc);
            expect(response.status).toBe(200);
    })
});

describe('PUT /situaciones', () => {
    it('Si no existe id de situacion en la URL retornar status 404', async () => {
        const response = await request(app).put(baseUrl + '/situaciones');
        expect(JSON.parse(JSON.stringify(response.body))).toMatchObject({});
        expect(response.status).toBe(404);

    });
    it('Si existe el id en la URL pero no existe el objeto situacion con ese id, retornar 404',
        async () => {
        mockingoose.Situacion.toReturn(null, 'findOne');
        const response = await request(app).put(baseUrl + '/situaciones/507f191e810c19729de860ea');
        expect(JSON.parse(JSON.stringify(response.body))).toMatchObject({});
        expect(response.status).toBe(404);

    });
    it('Si existe el id en la URL, existe el objeto con ese di, pero no se enviaron datos en body, retornar 500',
        async () => {
        const _doc = {
            _id: '507f191e810c19729de860ea',
            nombre: 'Contratado',
            requiereVencimiento: true
        };
        mockingoose.Situacion.toReturn(_doc, 'findOne');
        const response = await request(app).put(baseUrl + '/situaciones/507f191e810c19729de860ea');
        expect(JSON.parse(JSON.stringify(response.body))).toMatchObject({});
        expect(response.status).toBe(500);
    });
    it('Si existe el id en la URL, existe el objeto, se enviaron datos en body,retornar 200 y el objeto actualizado',
        async () => {
            const _doc = {
                _id: '507f191e810c19729de860ea',
                nombre: 'Contratado',
                requiereVencimiento: true
            };
            const body = {
                nombre: 'Contratados',
                requiereVencimiento: false
            }; 
            const _updatedDoc ={
                _id: '507f191e810c19729de860ea',
                nombre: 'Contratados',
                requiereVencimiento: false
            };
            mockingoose.Situacion.toReturn(_doc, 'findOne');
            mockingoose.Situacion.toReturn(_updatedDoc, 'save');
            const response = await request(app)
                .put(baseUrl + '/situaciones/507f191e810c19729de860ea')
                .send(body);
            expect(JSON.parse(JSON.stringify(response.body))).toMatchObject(_updatedDoc);
            expect(response.status).toBe(200);

    });
    it('Si existe algun problema en general retornar status 500', async () => {
        const body = {
            nombre: 'Contratados',
            requiereVencimiento: false
        }; 
        mockingoose.Situacion.toReturn(new Error(), 'findOne');
        mockingoose.Situacion.toReturn(new Error(), 'save');
        const response = await request(app)
                .put(baseUrl + '/situaciones/507f191e810c19729de860ea')
                .send(body);
        expect(JSON.parse(JSON.stringify(response.body))).toMatchObject({});
        expect(response.status).toBe(500);
    });
});

describe('DELETE /situaciones', () => {
    it('Si no existe id de situacion en la URL retornar status 404', async () => {
        const response = await request(app).del(baseUrl + '/situaciones');
        expect(JSON.parse(JSON.stringify(response.body))).toMatchObject({});
        expect(response.status).toBe(404);
    });
    it('Si existe el id en la URL pero no existe el objeto situacion con ese id, retornar 404',
        async () => {
        mockingoose.Situacion.toReturn(null, 'findOne');
        const response = await request(app).del(baseUrl + '/situaciones/507f191e810c19729de860ea');
        expect(JSON.parse(JSON.stringify(response.body))).toMatchObject({});
        expect(response.status).toBe(404);
    });
    it('Si existe el id en la URL, existe el objeto con ese id, entonces eliminar y retornar el objeto eliminado',
        async () => {
        const _deletedDoc = {
            _id: '507f191e810c19729de860ea',
            nombre: 'Contratados',
            requiereVencimiento: false
        };
        mockingoose.Situacion.toReturn(_deletedDoc, 'findOne');
        mockingoose.Situacion.toReturn(_deletedDoc, 'remove');
        const response = await request(app).del(baseUrl + '/situaciones/507f191e810c19729de860ea');
        expect(JSON.parse(JSON.stringify(response.body))).toMatchObject(_deletedDoc);
        expect(response.status).toBe(200);
    })
    it('Si existe algun problema general retornar status 500', async () => {
        mockingoose.Situacion.toReturn(new Error(), 'findOne');
        mockingoose.Situacion.toReturn(new Error(), 'remove');
        const response = await request(app).del(baseUrl + '/situaciones/507f191e810c19729de860ea');
        expect(JSON.parse(JSON.stringify(response.body))).toMatchObject({});
        expect(response.status).toBe(500);
    })
})

