export class DetalleOC {
    constructor(
        public odetid               ?: number,
        public orcoid            ?: number,
        public odetmeinid            ?: number,
        public odetestado            ?: number,
        public odetcantreal             ?: number,
        public odetcantdespachada             ?: number,
        public odetcantdespachada_aux             ?: number,
        public odetcantdevuelta           ?: number,
        public odetfechaanula      ?: string,
        public odetfechacreacion ?:string,
        public odetcantcalculada ?:number,
        public odetvalorcosto ?:number,
        public meincodigo ?: string,
        public meindesc ?: string,
        public valorcosto ?: number, 
        public meintipo ?:string,
        public acum ?: number,
        public pendiente ?: number,
        public fechavenc ?: string,
        public lote ?: string,
        public loteori ?: string,
    ){}
    
    

}
