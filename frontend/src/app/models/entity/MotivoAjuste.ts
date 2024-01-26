export class MotivoAjuste {
    public tipomotivoajus: number;
    public tipomotivoajusdes: string;

    constructor(tipomotivoajus: number, tipomotivoajusdes: string) {
        this.tipomotivoajus = tipomotivoajus;
        this.tipomotivoajusdes = tipomotivoajusdes;
    }

    public setIdmotivocargo(tipomotivoajus: number) {
        this.tipomotivoajus = tipomotivoajus;
    }
    public getIdmotivocargo() {
        return this.tipomotivoajus;
    }

    public setDescripcion(tipomotivoajusdes: string) {
        this.tipomotivoajusdes = tipomotivoajusdes;
    }
    public getDescripcion() {
        return this.tipomotivoajusdes;
    }
}