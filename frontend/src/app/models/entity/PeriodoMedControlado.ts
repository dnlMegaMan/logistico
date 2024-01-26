export class PeriodoMedControlado {
    public libcperiodo: number;
    // private desbodegacontrol: string;

    constructor(libcperiodo: number) {
        this.libcperiodo = libcperiodo;
        // this.desbodegacontrol = desbodegacontrol;
    }

    public setLibcperiodo(libcperiodo: number) {
        this.libcperiodo = libcperiodo;
    }
    public getLibcperiodo() {
        return this.libcperiodo;
    }

    // public setDescripcion(desbodegacontrol: string) {
    //     this.desbodegacontrol = desbodegacontrol;
    // }
    // public getDesbodegacontrol() {
    //     return this.desbodegacontrol;
    // }
}