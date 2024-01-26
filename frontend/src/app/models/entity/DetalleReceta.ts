export class DetalleReceta {
    constructor(

        public redeid         ?: number,        
        public codigoprod     ?: string,
        public descriprod     ?: string,
        public dosis          ?: number,
        public veces          ?: number,
        public tiempo         ?: number,
        public glosaposo      ?: string,
        public cantidadsolici ?: number,
        public cantidadadespa ?: number,
        public estadoprod     ?: string,
        public acciond        ?: string,

    ) { }
}