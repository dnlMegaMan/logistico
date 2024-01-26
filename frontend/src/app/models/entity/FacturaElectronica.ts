export class FacturaElectronica {
    private codigofactelec: number;
    private descrifactelec: string;

    constructor(codigofactelec: number, descrifactelec: string) {
        this.codigofactelec = codigofactelec;
        this.descrifactelec = descrifactelec;
    }

    public setIdCodigofactelec(codigofactelec: number) {
        this.codigofactelec = codigofactelec;
    }
    public getIdCodigofactelec() {
        return this.codigofactelec;
    }

    public setDescrifactelec(descrifactelec: string) {
        this.descrifactelec = descrifactelec;
    }
    public getDescrifactelec() {
        return this.descrifactelec;
    }
}