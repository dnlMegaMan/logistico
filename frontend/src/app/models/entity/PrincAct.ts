export class PrincAct {
    public idprinc: number;
    public descriprinc: string;

    constructor(idprinc: number, descriprinc: string) {
        this.idprinc = idprinc;
        this.descriprinc = descriprinc;
    }

    public setIdprinc(idprinc: number) {
        this.idprinc= idprinc;
    }
    public getIdprinc() {
        return this.idprinc;
    }

    public setDescripric(descriprinc: string) {
        this.descriprinc= descriprinc;
    }
    public getDescripcion() {
        return this.descriprinc;
    }
}