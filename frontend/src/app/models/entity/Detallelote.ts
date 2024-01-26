export class Detallelote {
    constructor(
        public row               ?: number,
        public sodeid            ?: number,
        public soliid            ?: number,
        public fechavto          ?: string,
        public lote              ?: string,
        public boddestino        ?: number,
        public bodorigen         ?: number,
        public cantidad          ?: number,
        public cantidaddev       ?: number,
        public codmei            ?: string,
        public descripcion       ?: string,
        public meinid            ?: number,
        public meintiporeg       ?: string,
        public tipobodorigen     ?: string,
        public tipoboddestino    ?: string,
        public glscombo          ?: string
    ) { }
}