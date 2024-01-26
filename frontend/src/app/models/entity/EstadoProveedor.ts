export class EstadoProveedor {
    private codigoestadoprov: number;
    private descriestadoprov: string;

    constructor(codigoestadoprov: number, descriestadoprov: string) {
        this.codigoestadoprov = codigoestadoprov;
        this.descriestadoprov = descriestadoprov;
    }

    public setIdCodigoestadoprov(codigoestadoprov: number) {
        this.codigoestadoprov = codigoestadoprov;
    }
    public getIdCodigoestadoprov() {
        return this.codigoestadoprov;
    }

    public setDescriestadoprov(descriestadoprov: string) {
        this.descriestadoprov = descriestadoprov;
    }
    public getDescriestadoprov() {
        return this.descriestadoprov;
    }
}