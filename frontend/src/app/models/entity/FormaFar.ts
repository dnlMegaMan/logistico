export class FormaFar {
    public idforma: number;
    public descriforma: string;

    constructor(idforma: number, descriforma: string) {
        this.idforma = idforma;
        this.descriforma = descriforma;
    }

    public setIdforma(idforma: number) {
        this.idforma= idforma;
    }
    public getIdforma() {
        return this.idforma;
    }

    public setDescriforma(descriforma: string) {
        this.descriforma= descriforma;
    }
    public getdescriForma() {
        return this.descriforma;
    }
}