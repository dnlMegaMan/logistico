export class BodegasTodas{
    constructor (
    public hdgcodigo       ?: number,
    public esacodigo       ?: number,
    public cmecodigo       ?: number,
    public bodcodigo       ?: number,
    public boddescripcion  ?: string,
    public bodmodificable  ?: string,
    public bodestado       ?: string,
    public bodtipobodega   ?: string,
    public bodtipoproducto ?: string,
    public bodfraccionable ?: string,
    public bodcontrolado   ?: string,
    public row             ?: number,
    public glosatipobodega ?: string,
    ) {}
}
