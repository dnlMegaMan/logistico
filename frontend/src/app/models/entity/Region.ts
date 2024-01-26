export class Region {
    private regioncodigo: number;
    private regiondescripcion: string;

    constructor(regioncodigo: number, regiondescripcion: string) {
        this.regioncodigo = regioncodigo;
        this.regiondescripcion = regiondescripcion;
    }

    public setIdregioncodigo(regioncodigo: number) {
        this.regioncodigo = regioncodigo;
    }
    public getIdregioncodigo() { 
        return this.regioncodigo;
    }

    public setregiondescripcion(regiondescripcion: string) {
        this.regiondescripcion = regiondescripcion;
    }
    public getregiondescripcion() {
        return this.regiondescripcion;
    }
}