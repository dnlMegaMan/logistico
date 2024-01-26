    export class BodegasrelacionadaAccion{
        constructor (
        public hdgcodigo       ?: number,
        public esacodigo       ?: number,
        public cmecodigo       ?: number,
        public bodcodigo       ?: number,
        public codigobodega    ?: number,
        public boddescripcion  ?: string,
        public bodmodificable  ?: string,
        public bodestado       ?: string,
        public bodtipobodega   ?: string,
        public bodtipoproducto ?: string,
        public bodcodigosolicita ?:number,
        public bodcodigoentrega ?:number,
        public tiporegori       ?:number,    

        ) {}
    }