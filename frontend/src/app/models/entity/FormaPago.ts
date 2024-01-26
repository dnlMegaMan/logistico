export class FormaPago {
    private idformapago: number;
    private descripcion: string;

    constructor(idformapago: number, descripcion: string) {
        this.idformapago = idformapago;
        this.descripcion = descripcion;
    }

    public setIdFormapago(idformapago: number) {
        this.idformapago = idformapago;
    }
    public getIdFormapago() {
        return this.idformapago;
    }

    public setDescripcion(descripcion: string) {
        this.descripcion = descripcion;
    }
    public getDescripcion() {
        return this.descripcion;
    }
}