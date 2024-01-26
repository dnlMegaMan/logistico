export class Holding {
    private hdgcodigo: number;
    private hdgnombre: string;

    constructor(hdgcodigo: number, hdgnombre: string) {
        this.hdgcodigo = hdgcodigo;
        this.hdgnombre = hdgnombre;
    }

    public setIdHolding(hdgcodigo: number) {
        this.hdgcodigo = hdgcodigo;
    }
    public getIdHolding() {
        return this.hdgcodigo;
    }

    public setHdgnombre(hdgnombre: string) {
        this.hdgnombre = hdgnombre;
    }
    public getHolding() {
        return this.hdgnombre;
    }
}