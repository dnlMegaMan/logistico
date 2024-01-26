import { ParamDetDevolBodega } from '../../models/entity/ParamDetDevolBodega';

export class ParamDevolBodega {
    constructor(
   
        public hdgcodigo           ?: number,
        public esacodigo           ?: number,
        public cmecodigo           ?: number,
        public servidor            ?: string,
        public usuariodespacha     ?: string,
        //public soliid              ?: number,
        //public sodeid              ?:number,
        // public cantsoli            ?: number,
        // public cantdespachada      ?: number,
        // public cantdevolucion      ?: number,
        // public cantrecepcionado    ?: number,
        public paramdetdevolbodega ?: ParamDetDevolBodega[],
    ) { }   
}