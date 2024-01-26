export class DetalleKardex{
    constructor (
       
        public fechamovim       ?: string,
        public horamovim        ?: string,
        public usuario          ?: string,
        public bodegaorigendes  ?: string,
        public bodegadestinodes ?: string,
        public rutproveedor     ?: string,
        public dvproveedor      ?: string,
        public proveedordesc    ?: string,
        public tipodocumentodes ?: string,
        public idsolicitud      ?: number,
        public numerodocumento  ?: number,
        public numeroreceta     ?: number,
        public numeroboleta     ?: number,
        public rutpaciente      ?: string,
        public nombrepaciente   ?: string,
        public tipomovimdes     ?: string,
        public stockanterior    ?: number,
        public stocknuevo       ?: number,
        public valcosanterior   ?: number,
        public valcosnuevo      ?: number,
        public valventanterior  ?: number,
        public valventnuevo     ?: number,
        public bodexteriororig  ?: string,
        public bodexteriordest  ?: string,
        public observaciones    ?: string,
        public tipoprestamo     ?: string       
        
        
    ) {}
}