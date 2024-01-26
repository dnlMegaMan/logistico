import { MovimientosFarmaciaDetDevol } from './MovimientosFarmaciaDetDevol';


export class MovimientosFarmaciaDet{
    constructor (
    public movimfardetid      ?: number,
    public movimfarid         ?: number,
    public fechamovimdet     ?: string,
    public tipomov           ?: number,
    public codigomein        ?: string,
    public meinid             ?: number,
    public cantidadmov        ?: number,
    public valorcostouni      ?: number,
    public valorventaUni      ?: number,
    public unidaddecompra     ?: number,
    public contenidounidecom  ?: number,
    public unidaddedespacho   ?: number,
    public cantidaddevol      ?: number,
    public cuentacargoid      ?: number,
    public numeroreposicion   ?: number,
    public incobrablefonasa   ?: string,
    public descripcionmein    ?: string,
    // public motivomovim        ?: number,
    public idtipomotivo       ?: number,
    public lote               ?: string,
    public fechavto          ?: string,
    public tiporegistro      ?: string,
    public cantidadadevolver  ?: number,
    public cantidadarecepcionar?: number,
    public movimientosfarmaciadetdevol ?: MovimientosFarmaciaDetDevol[],  

    ) {}
}