export class TipoMedicamento {
    private idtipomedicamento: number;
    private descripcion: string;

    constructor(idtipomedicamento: number, descripcion: string) {
        this.idtipomedicamento = idtipomedicamento;
        this.descripcion = descripcion;
    }

    public setIdtipomedicamento(idtipomedicamento: number) {
        this.idtipomedicamento = idtipomedicamento;
    }
    public getIdtipomedicamento() {
        return this.idtipomedicamento;
    }

    public setDescripcion(descripcion: string) {
        this.descripcion = descripcion;
    }
    public getDescripcion() {
        return this.descripcion;
    }
}