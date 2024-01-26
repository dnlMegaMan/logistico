export class EstadoSolicitudBodega {
    public codestado: number;
    public desestado : string;   


    constructor( codestado: number, desestado: string) {
        this.codestado = codestado;
        this.desestado = desestado;
    }

    public setcodprioridad(codestado: number) {
        this.codestado = codestado;
    }
    public getcodestado() {
        return this.codestado; 
    }
    public setAnomes(desestado:string) {
        this.desestado = desestado;
    }
    public getAnomes() {
        return this.desestado;
    }

    
}