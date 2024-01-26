export class ProductosCheck {
    constructor(
        public productoStock?: number,
        public vigente?: number,
        public consumoRestringido?: number,
        public repoAuto?: number,
        public fechaVenc?: number,
        public magistral?: number,
        public valorVar?: number,
        public pos?: number,
        public poss?: number,
        public consumoGeneral?: number,
        public precioRegulado?: number,
        public acondicionamiento?: number,
        public adecuado?: number,
        public artInsEspecial?: number,
        public codMein?: string,
        public usuario?: string,
        public servidor?: string,
        public accion?: string
    ) { }
}