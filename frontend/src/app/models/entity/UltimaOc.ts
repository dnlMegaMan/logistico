export class UltimaOc{
    private orcoid: number;
    private mensaje: string;

    constructor(orcoid: number, mensaje: string) {
        this.orcoid = orcoid;
        this.mensaje = mensaje;
    }

    public setOrcoId(orcoid: number) {
        this.orcoid = orcoid;
    }
    public getOrcoId() {
        return this.orcoid;
    }

    public setMensaje(mensaje: string) {
        this.mensaje = mensaje;
    }
    public getMensaje() {
        return this.mensaje;
    }

}