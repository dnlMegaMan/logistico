export class TipoDocumento {
    private idtipodocumento: number;
    private descripcion: string;

    constructor(idtipodocumento: number, descripcion: string) {
        this.idtipodocumento = idtipodocumento;
        this.descripcion = descripcion;
    }

    public setIdtipodocumento(idtipodocumento: number) {
        this.idtipodocumento = idtipodocumento;
    }
    public getIdFormapago() {
        return this.idtipodocumento;
    }

    public setDescripcion(descripcion: string) {
        this.descripcion = descripcion;
    }
    public getDescripcion() {
        return this.descripcion;
    }
}