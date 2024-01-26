import  { DetalleRecetaProg } from './DetalleRecetaProg'
export class ConsultaRecetaProgramada {
    constructor(
        public soliid               ?: number,
        public fechacreacion        ?: string,
        public bodegadesc           ?: string,
        public numerorecta          ?: number,
        public tipodocdescpaciente  ?: string,
        public numdocpaciente       ?: string,
        public nombrepaciente       ?: string,
        public tipodocdescprof      ?: string,
        public numdocprof           ?: string,
        public nombreprof           ?: string,
        public solicodambito        ?: number,
        public detallerecetaprog    ?: DetalleRecetaProg[]
    ) { }
}