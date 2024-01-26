export class ParamDetDevolPacRechazo {
    constructor(
        public soliid           ?: number,
        public sodeid           ?: number,
        public codmei           ?: string,
        public idmovimientodet  ?: number,
        public cantdispensada   ?: number,
        public cantdevuelta     ?: number,
        public cantidadadevolver?: number,
        public cantidadarechazar?: number,
        public observaciones    ?: string,
        public codtiporechazo   ?: number,
        public lote             ?: string,
        public fechavto         ?: string
    ) {}
}