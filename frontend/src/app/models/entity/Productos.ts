export class Productos{
    constructor (
        
        public campo             ?: string,
        public codigo            ?: string,
        public descripcion       ?: string,
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
        public mein              ?: number,
        public subfamilia        ?: number,
        public tiporegistro      ?: string,
        public unidaddespacho    ?:number,
        public valorcosto        ?: number,
        public valorventa        ?: number,
        public stockactual       ?: number,
    ) {}
}