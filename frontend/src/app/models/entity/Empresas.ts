export class Empresas {
    public esacodigo: number;
    public esanombre: string;

    constructor(esacodigo: number, esanombre: string) {
        this.esacodigo = esacodigo;
        this.esanombre = esanombre;
    }

    public setIdEmpresa(esacodigo: number) {
        this.esacodigo = esacodigo;
    }
    public getIdEmpresacodigo() {
        return this.esacodigo;
    } 

    public setcomunadescripcion(esanombre: string) {
        this.esanombre = esanombre;
    }
    public getEmpresanombre() {
        return this.esanombre;
    }
}