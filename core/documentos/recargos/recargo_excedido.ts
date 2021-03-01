import { DocumentoRecargos } from "./recargo";


export class DocumentoRecargosExcedidos extends DocumentoRecargos {

    getTitulo(){
        return "Adicional por Recargos Extraordinarios (Excedidos)";
    }

    /**
     * Retornamos solo los recargos excedidos
     * @param recargo 
     */
    getRecargosFiltrados(recargo){
        let agentesExcedidos = []
        for (const itemAgente of recargo.planilla) {
            if (itemAgente.items.length>7){
                const excedidos = itemAgente.items.length - 7;
                const newItems = itemAgente.items.slice(-excedidos);
                itemAgente.items = newItems;
                agentesExcedidos.push(itemAgente);
            }
        }
        recargo.planilla = agentesExcedidos;
        return recargo;
    }

}