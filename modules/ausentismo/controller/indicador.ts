import { IndicadorAusentismo } from '../schemas/indicador';


export async function addIndicador(req, res, next) {
    console.log('Adding Indicador');
    try {
        const obj = new IndicadorAusentismo({
            agente: req.body.agente,
            articulo: req.body.articulo,
            vigencia: req.body.vigencia,
            periodo: req.body.periodo,
            vencido: req.body.vencido,
            intervalos: req.body.intervalos
        });
        const objNuevo = await obj.save();
        return res.json(objNuevo);
    } catch (err) {
        return next(err);
    }
}