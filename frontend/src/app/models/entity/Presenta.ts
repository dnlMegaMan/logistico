export class Presenta {
    public idprese: number;
    public descriprese: string;

    constructor(idprese: number, descriprese: string) {
        this.idprese = idprese;
        this.descriprese = descriprese;
    }

    public setIdprese(idprese: number) {
        this.idprese= idprese;
    }
    public getIdprese() {
        return this.idprese;
    }

    public setDescriprese(descriprese: string) {
        this.descriprese= descriprese;
    }
    public getDescriprese() {
        return this.descriprese;
    }
}