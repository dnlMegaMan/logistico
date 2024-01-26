export class BodegaDestino {
    private boddescodigo: number;
    private boddesdescripcion: string;
    public bodcodigo: number;
    public boddescripcion: string;
    public bodtipobodega: string;

    constructor(boddescodigo: number, boddesdescripcion: string) {
        this.boddescodigo        = boddescodigo;
        this.boddesdescripcion   = boddesdescripcion;
    }

    public setIdbodegadestino(boddescodigo: number) {
        this.boddescodigo = boddescodigo;
    }
    public getIdbodegadestino() {
        return this.boddescodigo;
    }

    public setDescripcion(boddesdescripcion: string) {
        this.boddesdescripcion = boddesdescripcion;
    }
    public getDescripcion() {
        return this.boddesdescripcion;
    }
}
