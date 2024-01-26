import { GrabaDetalleDevolMovimiento } from './GrabaDetalleDevolMovimiento';

export class GrabaDetalleMovimientoFarmacia {
    constructor (
        public movimfarid       ?: number,
        public movimfardetid    ?: number, 
        public fechamovimdet    ?: string,
        public tipomov          ?: number,
        public codigomein       ?: string,
        public meinid           ?: number,
        public cantidadmov      ?: number,
        public valorcostouni    ?: number,
        public valorventaUni    ?: number,
        public unidaddecompra   ?: number, 
        public contenidounidecom?: number,
        public unidaddedespacho ?: number,
        public cantidaddevol    ?: number,
        public cuentacargoid    ?: number,
        public numeroreposicion ?: number,
        public incobrablefonasa ?: string,
        public descripcionmein  ?: string,
        public lote             ?: string,
        public fechavto         ?: string,
        public idtipomotivo     ?: number,
        public cantidadadevolver?: number,
        public cantidadarecepcionar?: number,
        public tiporeg          ?: string,
        public movimientosfarmaciadetdevol ?: GrabaDetalleDevolMovimiento[]
           
    ) {}
}