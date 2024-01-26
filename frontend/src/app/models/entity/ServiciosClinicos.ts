export class ServiciosClinicos {
    private servivcodigo     : number;
    private servicdescripcion: string;

    constructor(servivcodigo : number,servicdescripcion: string) {
        this.servivcodigo  = servivcodigo ;
        this.servicdescripcion = servicdescripcion;
    }

    public setIdServivcodigo (servivcodigo : number) {
        this.servivcodigo  = servivcodigo ;
    }
    public getIdServivcodigo () {
        return this.servivcodigo ;
    }

    public setServicdescripcion(servicdescripcion: string) {
        this.servicdescripcion = servicdescripcion;
    }
    public getServicdescripcion() {
        return this.servicdescripcion;
    }
}