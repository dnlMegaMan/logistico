import { GrabaDetalleMovimientoFarmacia } from './GrabaDetalleMovimientoFarmacia';

export class GrabaMovimientos{
     constructor (
        public movfaridedspachodevart?: number,
        public movimfarid           ?: number,
        public hdgcodigo            ?: number,
        public esacodigo            ?: number,
        public cmecodigo            ?: number,
        public servidor             ?: string,
        public usuario              ?: string,        
        public movimfecha           ?: string,
        public ctaid                ?: number,
        public cliid                ?: number,
        public estid                ?: number,
        public tipomov              ?: number,
        public bodegaorigen         ?: number,
        public bodegadestino        ?: number,       
        public proveedorid          ?: number,
        public orconumdoc           ?: number,
        public numeroguia           ?: number,
        public numeroreceta         ?: number,
        public fechadocumento       ?: string,
        public cantidadmov          ?: number,
        public valortotal           ?: number,
        
        public fechagrabacion       ?: string,
        public serviciocargoid      ?: number,
        public guiatipodcto         ?: number,
        public foliourgencia        ?: number,
        public numeroboletacaja     ?: number,
        public motivocargoid        ?: number,
        public pacambulatorio       ?: number,
        public tipoformuhcfar       ?: number,
        public cuentaid             ?: number,
        public clienterut           ?: string,
        public clientepaterno       ?: string,
        public clientematerno       ?: string,
        public clientenombres       ?: string,
        public proveedorrut         ?: string,
        public proveedordesc        ?: string,
        public movimudescr          ?: string,
	    public bodegadescr          ?: string,
	    public bodegadestinodes     ?: string,
	    public comprobantecaja      ?: string,
	    public estadocomprobantecaja?: number,
	    public glosaestadocaja      ?: string,
        
        // public bodorigen   ?: number,
        // public boddestino  ?: number,
        // public numeroboletacaja ?: number,
        
	    public movimientosfarmaciadet ?: GrabaDetalleMovimientoFarmacia[],
     

    ) {}
}