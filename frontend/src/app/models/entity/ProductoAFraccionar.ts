export class ProductoAFraccionar{
    constructor (
        
       
        public meincodprod            ?: string,
        public meindesprod       ?: string,
        public meinidprod              ?: number,
        public stockactual       ?: number,

        public clasificacion     ?: number,
        public estado            ?: number,
        public familia           ?: number,
        public incobfonasa       ?: string,
        public preparados        ?: string,
        public recetaretenida    ?: string,
        public solocompra        ?: string,
        public tipomedicamento   ?:number,
        public unidadcompra      ?: number,
        public tipoincob         ?: string,
        public margenmedicamento ?: number,
        
        public subfamilia        ?: number,
        public tiporegistro      ?: string,
        public unidaddespacho    ?:number,
        public valorcosto        ?: number,
        public valorventa        ?: number,
       
    ) {}
}