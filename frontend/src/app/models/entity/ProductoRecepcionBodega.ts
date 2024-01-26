export class ProductoRecepcionBodega {
    constructor(

        public hdgcodigo              ?: number,
        public esacodigo              ?: number,
        public cmecodigo              ?: number,
        public soliid                 ?: number,
        public sodeid                 ?: number,
        public lote                   ?: string,
        public fechavto               ?: string,
        public fecharecepcion         ?: string,
        public cantrecepcionada       ?: number,
        public cantdespachada         ?: number,
        public meinid                 ?: number,
        public codmei                 ?: string,
        public meindescri             ?: string,
        public cantsoli               ?: number,
        public cantdevuelta           ?: number,
        public cantrecepcionado       ?: number,
        public cantpendientedevolver  ?: number,
        public cantpendienterecepcion ?:number,
        public checkgrilla            ?: boolean,
       
        public cantdevolucion         ?: number,
        public mfdeid                 ?: number,       
        public mdevid                 ?: number,
        public movfid                 ?: number,       
        public servidor               ?: string,
        public cantpendienterecepdevol?: number
        
    ) { }
}