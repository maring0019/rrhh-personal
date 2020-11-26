import * as express from "express";
import * as bodyParser from "body-parser";
import * as request from "supertest";
import mockingoose from "mockingoose";

import { Agente } from "../schemas/agente";

import { Routes } from "../routes/agente";
import { AgenteController } from "./agente";
import errorMiddleware from "../../../middleware/error.middleware";

const baseUrl = "/api/modules/agentes";
const initAPI = () => {
    const app = express();
    app.use(bodyParser.json({ limit: "150mb" }));
    app.use(
        bodyParser.urlencoded({
            extended: true,
        })
    );
    app.use(baseUrl, Routes);
    app.use(errorMiddleware);
    return app;
};

let app = initAPI();

describe("POST /agentes", () => {
    // SI se produjo algun error en el proceso indicar con status 500
    // Si el DNI (combinado con algo?) existe entonces notificar con status y body {}
    // Si falta algun dato obligatorio (definido en el schema) notificar correctamente
    it("Si algo falla al insertar retornar status 500", async () => {
        mockingoose.Agente.toReturn(new Error("error"), "save");
        const response = await request(app).post(baseUrl + "/agentes");
        expect(response.status).toBe(500);
    });

    it("Si el body no tiene los atributos obligatorios retornar status 500 y un objeto vacio", async () => {
        const _doc = {};
        mockingoose.Agente.toReturn(_doc, "save");
        const response = await request(app).post(baseUrl + "/agentes");
        expect(JSON.parse(JSON.stringify(response.body))).toMatchObject(_doc);
        expect(response.status).toBe(500);
    });

    it("Si el agente ya existe entonces notificar con status 500 y body {}", async () => {
        let _app = initAPI();
        const body = {
            documento: "28588178",
            cuil: "20285881782",
            nombre: "Marcos",
            apellido: "Cisterna",
        };
        const mockCheckExiste = jest.spyOn(AgenteController, "_findAgente");
        const mockResultCheckExiste = {
            _id: "507f191e810c19729de860eb",
            documento: "28588178",
            cuil: "20285881782",
            nombre: "Marcos",
            apellido: "Cisterna",
        };
        mockCheckExiste.mockResolvedValue(mockResultCheckExiste);
        mockingoose.Agente.toReturn({}, "save");
        const response = await request(_app)
            .post(baseUrl + "/agentes")
            .send(body);

        expect(mockCheckExiste).toBeCalled();
        expect(JSON.parse(JSON.stringify(response.body))).toMatchObject({});
        expect(response.status).toBe(400);
        mockCheckExiste.mockRestore();
    });

    it("Si el agente no existe y todos los datos del body estan bien entonces notificar con status 200 y body {}", async () => {
        const _doc = {
            _id: "507f191e810c19729de860eb",
            documento: "28588178",
            cuil: "20285881782",
            nombre: "Marcos",
            apellido: "Cisterna",
        };
        const body = {
            documento: "28588178",
            cuil: "20285881782",
            nombre: "Marcos",
            apellido: "Cisterna",
            sexo: "masculino",
            genero: "masculino",
        };
        const mockCheckExiste = jest.spyOn(AgenteController, "_findAgente");
        mockCheckExiste.mockResolvedValue({});
        mockingoose.Agente.toReturn(_doc, "save");
        const response = await request(app)
            .post(baseUrl + "/agentes")
            .send(body);
        expect(mockCheckExiste).toHaveBeenCalled();
        expect(JSON.parse(JSON.stringify(response.body))).toMatchObject(_doc);
        expect(response.status).toBe(200);
        mockCheckExiste.mockRestore();
    });
});

describe("Controles para determinar si un objeto es vacio", () => {
    it("Si el objeto es un json vacio retornar true", async () => {
        const result = AgenteController._isEmpty({});
        expect(result).toEqual(true);
    });

    it("Si el objeto es null retornar true", async () => {
        const result = AgenteController._isEmpty(null);
        expect(result).toEqual(true);
    });

    it("Si el objeto es undefined retornar true", async () => {
        const result = AgenteController._isEmpty(undefined);
        expect(result).toEqual(true);
    });

    it("Si el objeto es una cadena vacia retornar true", async () => {
        const result = AgenteController._isEmpty("");
        expect(result).toEqual(true);
    });

    it("Si el objeto tiene al menos un atributo retornar false", async () => {
        const result = AgenteController._isEmpty({ documento: 28588178 });
        expect(result).toEqual(false);
    });
});

describe("Controles sobre atributos requeridos de un Agente ", () => {
    it("Si el agente no tiene todos los atributos requeridos, retornar un array con los atributos faltantes", async () => {
        const agente = {
            nombre: "Marcos",
            apellido: "Cisterna",
            fechaNacimiento: "18/03/1981",
            sexo: "masculino",
            genero: "masculino",
        };
        const expectedResult = ["documento"];
        const result = AgenteController._validateAgenteAttributes(agente);
        expect(result).toEqual(expectedResult);
    });

    it("Si el agente tiene todos los atributos pero algun/os atributo/s es nulo, retornar un array con el atributo faltante", async () => {
        const agente = {
            documento: "28588178",
            nombre: "",
            apellido: "Cisterna",
            fechaNacimiento: "18/03/1981",
            sexo: "masculino",
            genero: "masculino",
        };
        const expectedResult = ["nombre"];
        const result = AgenteController._validateAgenteAttributes(agente);
        expect(result).toEqual(expectedResult);
    });

    it("Si el agente tiene todos los atributos y valores requeridos, retornar un array vacio", async () => {
        const agente = new Agente({
            documento: "12065564",
            cuil: "27-12065564-2",
            nombre: "HILDA",
            apellido: "ALBARRAN",
            sexo: "femenino",
            genero: "femenino",
        });
        const expectedResult = [];
        const result = AgenteController._validateAgenteAttributes(agente);
        expect(result).toEqual(expectedResult);
    });

    it(
        "Si el agente no tiene los atributos requeridos no se puede determinar la existencia del agente," +
            "por lo tanto retornar error indicando esta situacion",
        async () => {
            const agente = {
                nombre: "Marcos",
                apellido: "Cisterna",
                sexo: "",
                fechaNacimiento: "",
            };
            await expect(
                AgenteController._findAgente(agente)
            ).rejects.toThrowError("Faltan atributos requeridos");
        }
    );
});

describe("Controles sobre la existencia de un Agente ", () => {
    // TODO
    // it('Si el agente tiene todos los atributos requeridos, realizar una busqueda en la base utilizandolos',
    //     async () => {
    //         const agente = {
    //             documento: '28588178',
    //             nombre: 'Marcos',
    //             apellido: 'Cisterna',
    //             sexo:'',
    //             fechaNacimiento: '',
    //         }
    //         AgenteController._findAgente(agente);
    //         mockingoose.Agente.toHaveBeenCalled(agente, 'find');
    // });
    it("Si se realizo una busqueda, y se encontro un agente retornar el mismo", async () => {
        const agente = {
            documento: "28588178",
            nombre: "Marcos",
            apellido: "Cisterna",
            fechaNacimiento: "18/03/2018",
            sexo: "masculino",
            genero: "masculino",
        };
        const agenteFound = {
            documento: "28588178",
            nombre: "Marcos",
            apellido: "Cisterna",
            sexo: "masculino",
            fechaNacimiento: "18/03/2018",
            cuil: "20-28588178-2",
        };
        mockingoose.Agente.toReturn(agenteFound, "findOne");
        const result = await AgenteController._findAgente(agente);
        expect(result).toHaveProperty("documento", "28588178");
        expect(result).toHaveProperty("nombre", "Marcos");
        expect(result).toHaveProperty("apellido", "Cisterna");
        // expect(result).toHaveProperty('sexo', 'masculino'); // TODO Validar el sexo cuando este disponible
        // expect(result).toHaveProperty('fechaNacimiento', '18/03/1981');
    });

    it("Si se realizo una busqueda, y no se encontro un agente retornar null", async () => {
        const agente = {
            documento: "28588178",
            nombre: "Marcos",
            apellido: "Cisterna",
            fechaNacimiento: "18/03/2018",
            sexo: "masculino",
            genero: "masculino",
        };
        const agenteFound = null;
        mockingoose.Agente.toReturn(agenteFound, "findOne");
        const result = await AgenteController._findAgente(agente);
        expect(result).toBe(agenteFound);
    });
});
