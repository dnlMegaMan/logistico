export class Ciudad {
    private ciudadcodigo: number;
    private ciudaddescripcion: string;

    constructor(ciudadcodigo: number, ciudaddescripcion: string) {
        this.ciudadcodigo = ciudadcodigo;
        this.ciudaddescripcion = ciudaddescripcion;
    }

    public setIdciudadcodigo(ciudadcodigo: number) {
        this.ciudadcodigo = ciudadcodigo;
    }
    public getIdciudadcodigo() { 
        return this.ciudadcodigo;
    }

    public setciudaddescripcion(ciudaddescripcion: string) {
        this.ciudaddescripcion = ciudaddescripcion;
    }
    public getciudaddescripcion() {
        return this.ciudaddescripcion;
    }
}