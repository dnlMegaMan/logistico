export class MovimientosFarmaciaDetDevol {
    constructor (
        public movimfarid         ?: number,
        public movimfardetid      ?: number, 
        public movimfardetdevolid ?: number,
        public tipomov            ?: number,
        public fechamovdevol      ?: string,
        public cantidaddevol      ?: number,
        public responsablenom     ?: string,
        public cuentacargoid      ?: number,
        public cantidaddevoltot   ?: number,
        public hdgcodigo          ?: number,
        public esacodigo          ?: number,
        public cmecodigo          ?: number,
        public servidor           ?: string,
     ) {}
}