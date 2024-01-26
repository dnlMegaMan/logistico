import { DetalleConsultaConsumoLote } from "./DetalleConsultaConsumoLote";

export class ConsultaConsumoLote{
    constructor (

        public codigo          ?: string,
        public descripcion     ?: string,  
        public lote            ?: string,
        public detalleconsulta ?: DetalleConsultaConsumoLote[]
      
    ) {}
}