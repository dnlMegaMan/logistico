export class PeriodoCierreKardex{
    constructor (
        public hdgcodigo        ?: number,       
        public cmecodigo        ?: number,
        public codbodega    ?: number,
        public ckarfechaapertura?: string,
        public ckarfechacierre  ?: string,
        public ckarid           ?: number,
        public ckarperiodo      ?: number,      
        public ckarcusuario      ?: string,
        
    ) {}
}