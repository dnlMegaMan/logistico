export class ConsultaLibroControlado {
    constructor(
        public libcid               ?: number,
        public correlativo          ?: number,
        public codbodegacontrolados ?: number,
        public meinid               ?: number,
        public meincodmei           ?: string,
        public meindescri           ?: string,
        public movimfecha           ?: string,
        public movimdescri          ?: string,
        public tipomotivodes        ?: string,
        public fbobdescri           ?: string,
        public nroreceta            ?: number,
        public nrosolicitud         ?: string,
        public rutprof              ?: string,
        public nombreprof           ?: string,
        public rutpaciente          ?: string,
        public nombrepaciente       ?: string,
        public cantidadentrada      ?: number,
        public cantidadsalida       ?: number,
        public cantidadsaldo        ?: number,
        public referencia           ?: number

    ) { }
}
