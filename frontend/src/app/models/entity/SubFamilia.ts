export class SubFamilia {
    public idsubfamilia: number;
    public descripcion: string;

    constructor(idsubfamilia: number, descripcion: string) {
        this.idsubfamilia = idsubfamilia;
        this.descripcion = descripcion;
    }

    public setIdsubfamilia(idsubfamilia: number) {
        this.idsubfamilia = idsubfamilia;
    }
    public getIdsubfamilia() {
        return this.idsubfamilia;
    }

    public setDescripcion(descripcion: string) {
        this.descripcion = descripcion;
    }
    public getDescripcion() {
        return this.descripcion;
    }
}