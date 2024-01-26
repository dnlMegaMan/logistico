export class ListaProveedor {
    private idlistaproveedor: number;
    private descripcion: string;

    constructor(idlistaproveedor: number, descripcion: string) {
        this.idlistaproveedor = idlistaproveedor;
        this.descripcion = descripcion;
    }

    public setIdlistaproveedor(idlistaproveedor: number) {
        this.idlistaproveedor = idlistaproveedor;
    }
    public getIdlistaproveedor() {
        return this.idlistaproveedor;
    }

    public setDescripcion(descripcion: string) {
        this.descripcion = descripcion;
    }
    public getDescripcion() {
        return this.descripcion;
    }
}