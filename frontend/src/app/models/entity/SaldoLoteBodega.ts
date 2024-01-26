export class SaldoLoteBodega {    
    constructor (
        public  hdgcodigo ?: number,
        public  cmecodigo ?: number,
        public  idbodega ?: number,
        public  idproducto ?: string,
        public  lote  ?: string,
    	public  fechavencimiento ?: string,
        public  saldo ?: number,
    ) {
        
    }
   
}