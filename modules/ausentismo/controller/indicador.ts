import { IndicadorAusentismo } from '../schemas/indicador';


export async function addIndicador(req, res, next) {
    try {
        const obj = new IndicadorAusentismo({
            agente: req.body.nombre,
            articulo: req.body.pais,
            vigencia: 2017,
            periodo: null,
            intervalos:[               
                {
                    totales: Number,
                    ejecutadas: Number,
                    disponibles: Number,
                    asignadas: Number, 
                }
            ]
        });
        const objNuevo = await obj.save();
        return res.json(objNuevo);
    } catch (err) {
        return next(err);
    }
}


// {
//     "agente" : {
//         "id" : ObjectId("5ceee3437fb498034827221a")
//     },
//     "articulo" : {
//         "codigo" : "3",
//         "id" : ObjectId("5d442dfff3edc1c04fb71db8")
//     },

//     "vigencia": 2017,
//     "periodo": null,
//     "intervalos":[               
//         {
//             "totales": 21,
//             "ejecutadas": 15,
//             "disponibles": 6,
//             "asignadas": 0
//         }
//     ]
// }