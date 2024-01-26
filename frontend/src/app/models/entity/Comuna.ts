export class Comuna {
    private comunacodigo: number;
    private comunadescripcion: string;

    constructor(comunacodigo: number, comunadescripcion: string) {
        this.comunacodigo = comunacodigo;
        this.comunadescripcion = comunadescripcion;
    }

    public setIdComuna(comunacodigo: number) {
        this.comunacodigo = comunacodigo;
    }
    public getIdcomunacodigo() {
        return this.comunacodigo;
    } 

    public setcomunadescripcion(comunadescripcion: string) {
        this.comunadescripcion = comunadescripcion;
    }
    public getcomunadescripcion() {
        return this.comunadescripcion;
    }
}