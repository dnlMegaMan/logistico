export class MovimientoInterfazBodegas {
    constructor (
        public  id                  ?: number,
        public  soliid              ?: number,
        public  fecha               ?: string,
        public  tipo                ?: string,
        public  tipomovimiento      ?: string,
        public  bodegaorigen        ?: string,
        public  bodegadestino       ?: string,
        public  codigoarticulo      ?: string,
        public  cantidad            ?: number,
        public  referenciacontable  ?: number,
        public  intcargoestado      ?: string,
        public  intcargofecha       ?: string,
        public  intcargoerror       ?: string,
        public  interpestado        ?: string,
        public  interpfecha         ?: string,
        public  interperror         ?: string,
        public  descripcionproducto ?: string,
        public  hdgcodigo           ?: number,
        public  esacodigo           ?: number,
        public  cmecodigo           ?: number,
        public  fechainicio         ?: string,
        public  fechatermino        ?: string,
        public  servicio            ?: string,
        public  servidor            ?: string,
        public  usuario             ?: string,
        public  marca               ?: boolean,
        public  codtipmov           ?: number,
        public  agrupador           ?: number

 ) { }
}