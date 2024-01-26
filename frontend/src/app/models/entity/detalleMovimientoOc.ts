export class DetalleMovimientoOc {
    constructor(
        public odmoid               ?: number,
        public odmofecha             ?: string,
        public odmomonto         ?: number,
        public odmoresponsable            ?: string,
        public odmoguiaid           ?: number,
        public odmoorcoid       ?: number,
        public odmoodetid        ?:number,   
        public odmocantidad      ?:number,   
        public odmocantdevuelta   ?:number,
        public odmofechavencimiento  ?:string,
        public adevolver ?:number,
        public motivodev ?:number,
        public motivodevdesc ?:string,
        //extra del lote
        public lote             ?: string,
        public hdgcodigo               ?: number,
        public esacodigo            ?: number,
        public cmecodigo            ?: number,
        public meinid             ?: number,
        public tipodev            ?: number,
        public notadev            ?: number,
        public fechadev             ?: string,
    ) { }
}


