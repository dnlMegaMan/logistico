export class Unidades {
    hdgcodigo: number;
    esacodigo: number;
    cmecodigo: number;
    unidadid: number;
    servdescripcion: string;
    codservicio: string;

    constructor(
        hdgcodigo?: number,
        esacodigo?: number,
        cmecodigo?: number,
        unidadid?: number,
        servdescripcion?: string,
        codservicio?: string
    ) {
        this.hdgcodigo = hdgcodigo;
        this.esacodigo = esacodigo;
        this.cmecodigo = cmecodigo;
        this.unidadid = unidadid;
        this.servdescripcion = servdescripcion;
        this.codservicio = codservicio;
    }

}
