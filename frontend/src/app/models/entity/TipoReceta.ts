export class TipoReceta {
    public tiporecetacod     : number;
    public tiporecetadesc    : string;

    constructor(tiporecetacod: number, tiporecetadesc: string) {
        this.tiporecetacod = tiporecetacod;
        this.tiporecetadesc = tiporecetadesc;
    }

    public setIdtiporecetacod(tiporecetacod: number) {
        this.tiporecetacod = tiporecetacod;
    }
    public getIdtiporecetacod() {
        return this.tiporecetacod;
    }

    public settiporecetadesc(tiporecetadesc: string) {
        this.tiporecetadesc = tiporecetadesc;
    }
    public gettiporecetadesc() {
        return this.tiporecetadesc;
    }
}
