export class Familia {
    public idfamilia: number;
    public descripcion: string;

    constructor(idfamilia: number, descripcion: string) {
        this.idfamilia = idfamilia;
        this.descripcion = descripcion;
    }

    public setIdfamilia(idfamilia: number) {
        this.idfamilia = idfamilia;
    }
    public getIdfamilia() {
        return this.idfamilia;
    }

    public setDescripcion(descripcion: string) {
        this.descripcion = descripcion;
    }
    public getDescripcion() {
        return this.descripcion;
    }
}