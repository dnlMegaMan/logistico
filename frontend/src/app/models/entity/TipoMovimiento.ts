export class TipoMovimiento {
    public idtipodespacho: number;
    public tipodespachodes: string;

    constructor(idtipodespacho: number, tipodespachodes: string) {
        this.idtipodespacho = idtipodespacho;
        this.tipodespachodes = tipodespachodes;
    }

    public setIdtipodespacho(idtipodespacho: number) {
        this.idtipodespacho = idtipodespacho;
    }
    public getIdtipodespacho() {
        return this.idtipodespacho;
    }

    public setTipodespachodes(tipodespachodes: string) {
        this.tipodespachodes = tipodespachodes;
    }
    public getTipodespachodes() {
        return this.tipodespachodes;
    }
}