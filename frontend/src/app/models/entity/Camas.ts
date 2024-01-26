export class Camas {
    hdgcodigo: number;
    esacodigo: number;
    cmecodigo: number;
    camid: number;
    camaid: number;
    camadescripcion: string;

    constructor(
        hdgcodigo?: number,
        esacodigo?: number,
        cmecodigo?: number,
        camaid?: number,
        camadescripcion?: string,
    ) {
        this.hdgcodigo = hdgcodigo;
        this.esacodigo = esacodigo;
        this.cmecodigo = cmecodigo;
        this.camaid = camaid;
        this.camadescripcion = camadescripcion;
    }
}