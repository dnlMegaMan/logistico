export class Clasificacion {
    public idclasificacion: number;
    public clase: string;
    public descripcion: string;

    constructor(idclasificacion: number, clase: string, descripcion: string) {
        this.idclasificacion = idclasificacion;
        this.clase = clase;
        this.descripcion = descripcion;
    }

    public setIdClasificacion(idclasificacion: number) {
        this.idclasificacion = idclasificacion;
    }
    public getIdClasificacion() {
        return this.idclasificacion;
    }

    public setClase(clase: string) {
        this.clase = clase;
    }
    public getClase() {
        return this.clase;
    }

    public setDescripcion(descripcion: string) {
        this.descripcion = descripcion;
    }
    public getDescripcion() {
        return this.descripcion;
    }
}