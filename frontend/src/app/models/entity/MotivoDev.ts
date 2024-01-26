export class MotivoDev {
    private codmotivodev: number;
    private glsmotivodev: string;

    constructor(codmotivodev: number, glsmotivodev: string) {
        this.codmotivodev = codmotivodev;
        this.glsmotivodev = glsmotivodev;
    }

    public setCodMotivoDev(codmotivodev: number) {
        this.codmotivodev = codmotivodev;
    }
    public getCodMotivoDev() {
        return this.codmotivodev;
    }

    public setGlsMotivoDev(glsmotivodev: string) {
        this.glsmotivodev = glsmotivodev;
    }
    public getGlsMotivoDev() {
        return this.glsmotivodev;
    }
}