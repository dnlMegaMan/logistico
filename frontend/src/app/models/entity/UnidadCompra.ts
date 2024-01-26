export class UnidadCompra {
    public idudecompra: number;
    public descripcion: string;
    public codigoudecompra: number;

    constructor(idudecompra: number, descripcion: string,codigoudecompra: number) {
        this.idudecompra = idudecompra;
        this.descripcion = descripcion;
        this.codigoudecompra = codigoudecompra
    }

    public setIdudecompra(idudecompra: number) {
        this.idudecompra = idudecompra;
    }
    public getIdudecompra() {
        return this.idudecompra;
    }

    public setDescripcion(descripcion: string) {
        this.descripcion = descripcion;
    }
    public getDescripcion() {
        return this.descripcion;
    }

    public setCodigoudecompra(codigoudecompra: number){
        this.codigoudecompra =codigoudecompra
    }

    public getCodigoudecompra(){
        return this.codigoudecompra;
    }
}
