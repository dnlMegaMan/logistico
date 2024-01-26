export class BodegaVigente {
    private codigobodega: number;
    private bodegavigente: string;

    constructor(codigobodega: number, bodegavigente: string) {
        this.codigobodega = codigobodega;
        this.bodegavigente =  bodegavigente;
    }

    public setCodigobodega(codigobodega: number) {
        this.codigobodega = codigobodega;
    }
    public getCodigobodega() {
        return this.codigobodega;
    }

    public setBodegavigente(bodegavigente: string) {
        this. bodegavigente =  bodegavigente;
    }
    public getBodegavigente() {
        return this. bodegavigente;
    }
}