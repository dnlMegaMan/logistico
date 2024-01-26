export class ParamGrabaDetallesMovim{
    constructor (
        
        public movimfarid       ?: number,
        public tipomov          ?: number,
        public codigomein       ?: string,
        public meinid           ?: number,
        public cantidadmov      ?: number,
        public valorcosto       ?: number,
        public valorventa       ?: number,
        public cantidaddevol    ?: number,
        public unidaddecompra   ?: number,
        public unidaddedespacho ?: number,
        public usuario          ?: string,
        public servidor         ?: string

    ) {}
}