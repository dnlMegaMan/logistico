export class CreaSolicitud {
    constructor(

        public campo            ?: string,
        public codigo           ?: string,
        public meinid           ?: number,
        public descripcion      ?: string,
        public stockbodsolici ?: number,
        public stockbodorigen ?: number,
        public cantidadsolic    ?: number
    ) { }
}