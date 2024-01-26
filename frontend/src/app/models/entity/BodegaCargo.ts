export class BodegaCargo {
    public bodsercodigo: number;
    private bodserdescripcion: string;

    constructor(bodsercodigo: number, bodserdescripcion: string) {
        this.bodsercodigo = bodsercodigo;
        this.bodserdescripcion =bodserdescripcion;
    }

    public setIdbodegacargo(bodsercodigo: number) {
        this.bodsercodigo = bodsercodigo;
    }
    public getIdbodegacargo() {
        return this.bodsercodigo;
    }

    public setDescripcion(bodserdescripcion: string) {
        this.bodserdescripcion = bodserdescripcion;
    }
    public getDescripcion() {
        return this.bodserdescripcion;
    }
}