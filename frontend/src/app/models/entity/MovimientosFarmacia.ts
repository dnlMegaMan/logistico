import { MovimientosFarmaciaDet } from './MovimientosFarmaciaDet';

export class MovimientosFarmacia{
     constructor (
        public movimfarid     ?: number,
        public hdgcodigo      ?: number,
        public esacodigo      ?: number,
        public cmecodigo      ?: number,
        public tipomov        ?: number,
        public movimfecha     ?: string,
        public usuario        ?: string,
        public soliid         ?: number,
        public bodegaorigen   ?: number,
        public bodegadestino  ?: number,
        public estid          ?: number,
        public proveedorid    ?: number,
        public orconumdoc     ?: number,
        public numeroguia     ?: number,
        public numeroreceta   ?: number,
        public fechadocumento ?: string,
        public cantidadmov    ?: number,
        public valortotal     ?: number,
        public cliid          ?: number,
        public fechagrabacion ?: string,
        public serviciocargoid ?: number,
        public guiatipodcto    ?: number,
        public foliourgencia   ?: number,
        public numeroboletacaja ?: number,
        public motivocargoid    ?: number,
        public pacambulatorio   ?: number,
        public tipoformuhcfar   ?: number,
        public cuentaid         ?: number,
        public clienterut ?: string,
        public clientepaterno?: string,
        public clientematerno?: string,
        public clientenombres?: string,
        public proveedorrut?: string,
        public ProveedorDesc    ?: string,
        public Servidor         ?: string,
        public movimudescr ?: string,
	    public bodegadescr?: string,
	    public bodegadestinodes?: string,
	    public comprobantecaja?: string,
	    public estadocomprobantecaja?: number,
	    public glosaestadocaja?: string,
	    public movimientosfarmaciadet ?: MovimientosFarmaciaDet[],
     

    ) {}
}


