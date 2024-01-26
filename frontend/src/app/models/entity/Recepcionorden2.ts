export class Recepcionorden2{
    constructor (
        public guiacantidaditem     ?: number, 
        public guiafechaemision     ?: string,
        public guiafecharecepcion   ?: string,
        public guiamontototal       ?: number,
        public guiatipodocto        ?: string,
        public nomproveedor         ?: string,
        public rutproveedor         ?:string  
    ) {}
}