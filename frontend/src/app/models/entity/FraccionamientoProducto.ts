import {Detallelote} from "../entity/Detallelote"

export class FraccionamientoProducto {
    constructor(
        public codmei    ?: string,
        public meindescri?: string,
        public cantidad  ?: number,
        public factordist?: number,
        public meiniddest?: number,
        public cantidaddest ?: number,
        public stockactual?:number,
        public lote       ?: string,
        public detallelote ?: Detallelote[], 
        public fechavto  ?: string,
        public factordistresp?: number,
        public marcacheckgrilla?: boolean,
        public bloqcampogrilla?: boolean
       
    ) { }
}