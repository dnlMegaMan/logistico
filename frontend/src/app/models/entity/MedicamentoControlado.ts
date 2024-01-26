export class MedicamentoControlado{
    constructor (
        public hdgcodigo        ?: number,       
        public cmecodigo        ?: number,
        public codbodegacontrolados?: number,
        public libcfechaapertura?: string,
        public libcfechacierre  ?: string,
        public libcid           ?: number,
        public libcperiodo      ?: number,      
        public libcusuario      ?: string,
        
    ) {}
}