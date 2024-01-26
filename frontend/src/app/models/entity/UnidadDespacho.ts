export class UnidadDespacho {
    public idudespacho: number;
    public descripcion: string;
    public codigoudespacho: number

    constructor(idudespacho: number, descripcion: string,codigoudespacho:number) {
        this.idudespacho = idudespacho;
        this.descripcion = descripcion;
        this.codigoudespacho = codigoudespacho
    }

    public setIdudespacho(idudespacho: number) {
        this.idudespacho = idudespacho;
    }
    public getIdudespacho() {
        return this.idudespacho;
    }

    public setDescripcion(descripcion: string) {
        this.descripcion = descripcion;
    }
    public getDescripcion() {
        return this.descripcion;
    }

    public setCodigoudespacho(codigoudespacho:number){
        this.codigoudespacho = codigoudespacho;
    }

    public getCodigoudespacho(){
        return this.codigoudespacho;
    }
}
