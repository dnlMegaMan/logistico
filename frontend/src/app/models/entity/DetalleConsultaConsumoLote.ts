export class DetalleConsultaConsumoLote{
    constructor (

        public mfdefecha            ?: string,
        public codtipidentificacion ?: number,  
        public glstipidentificacion ?: string,
        public clinumidentificacion ?: string,
        public cuentaid             ?: number,
        public cliapepaterno        ?: string,
        public cliapematerno        ?: string,
        public clinombres           ?: string,
        public nomcompletopac       ?: string,
        public servcodigo           ?: string,
        public servdescripcion      ?: string,
        public soliid               ?: number,  
        public mfdecantidad         ?: number,  
        public fboddescripcion      ?: string,
        public saldo                ?: number,
        public mensaje              ?: string
      
    ) {}
}