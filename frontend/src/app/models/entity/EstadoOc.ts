export class EstadoOc {
    private idestadooc: number;
    private descripcion: string;

    constructor(idestadooc: number, descripcion: string) {
        this.idestadooc = idestadooc;
        this.descripcion = descripcion;
    }

    public setIdEstadooc(idestadooc: number) {
        this.idestadooc = idestadooc;
    }
    public getIdEstadooc() {
        return this.idestadooc;
    }

    public setDescripcion(descripcion: string) {
        this.descripcion = descripcion;
    }
    public getDescripcion() {
        return this.descripcion;
    }
}