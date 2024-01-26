export class Pais {
    private paiscodigo: number;
    private paisdescripcion: string;

    constructor(paiscodigo: number, paisdescripcion: string) {
        this.paiscodigo = paiscodigo;
        this.paisdescripcion = paisdescripcion;
    }

    public setIdpaiscodigo(paiscodigo: number) {
        this.paiscodigo = paiscodigo;
    }
    public getIdpaiscodigo() { 
        return this.paiscodigo;
    }

    public setpaisdescripcion(paisdescripcion: string) {
        this.paisdescripcion = paisdescripcion;
    }
    public getpaisdescripcion() {
        return this.paisdescripcion;
    }
}