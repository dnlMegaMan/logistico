export class TipoProducto {
    private idtipoproducto: number;
    private descripcion: string;

    constructor(idtipoproducto: number, descripcion: string) {
        this.idtipoproducto = idtipoproducto;
        this.descripcion = descripcion;
    }

    public setIdTipoproducto(idtipoproducto: number) {
        this.idtipoproducto = idtipoproducto;
    }
    public getIdTipoproducto() {
        return this.idtipoproducto;
    }

    public setDescripcion(descripcion: string) {
        this.descripcion = descripcion;
    }
    public getDescripcion() {
        return this.descripcion;
    }
}