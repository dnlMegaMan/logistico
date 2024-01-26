export class DetalleRecetaProg {
    constructor(

        public codmei            ?: string,
        public meindescri        ?: string,
        public dosis             ?: number,
        public formulacion       ?: number,
        public dias              ?: number,
        public cantsoli          ?: number,
        public cantdespachada    ?: number,
        public cantpendiente     ?: number
    ) { }
}