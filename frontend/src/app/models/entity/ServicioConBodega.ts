export class ServicioConBodega {
    private serviciocodigo     : number;
    private serviciodescripcion: string;

    constructor(serviciocodigo : number,serviciodescripcion: string) {
        this.serviciocodigo  = serviciocodigo ;
        this.serviciodescripcion = serviciodescripcion;
    }

    public setIdServiciocodigo (serviciocodigo : number) {
        this.serviciocodigo  = serviciocodigo ;
    }
    public getIdServiciocodigo () {
        return this.serviciocodigo ;
    }

    public setServiciodescripcion(serviciodescripcion: string) {
        this.serviciodescripcion = serviciodescripcion;
    }
    public getServiciodescripcion() {
        return this.serviciodescripcion;
    }
}