export class LoteOc {
    constructor(
        public hdgcodigo               ?: number,
        public esacodigo            ?: number,
        public cmecodigo            ?: number,
        public bodid            ?: number,
        public meinid             ?: number,
        public lote             ?: string,
        public fechavencimiento           ?: string,
        public saldo      ?: number,
        public provid ?:number,
        public odetid ?: number,
    ){}
    
    

}
