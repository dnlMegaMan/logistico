export class MotivoCargo {
    private idtipomotivo: number;
    private tipomotivodes: string;

    constructor(idtipomotivo: number, tipomotivodes: string) {
        this.idtipomotivo = idtipomotivo;
        this.tipomotivodes = tipomotivodes;
    }

    public setIdmotivocargo(idtipomotivo: number) {
        this.idtipomotivo = idtipomotivo;
    }
    public getIdmotivocargo() {
        return this.idtipomotivo;
    }

    public setDescripcion(tipomotivodes: string) {
        this.tipomotivodes = tipomotivodes;
    }
    public getDescripcion() {
        return this.tipomotivodes;
    }
}