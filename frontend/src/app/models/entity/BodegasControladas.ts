export class BodegasControladas {
    public codbodegacontrol: number;
    private desbodegacontrol: string;

    /* Esto un parche para el componente de consulta de libro controlado, ya que la respuesta desde 
     * el backend no contiene los otros campos. */
    public codbodegacontrolados: number
    public desbodegacontrolados: string

    constructor(codbodegacontrol: number, desbodegacontrol: string) {
        this.codbodegacontrol = codbodegacontrol;
        this.desbodegacontrol = desbodegacontrol;

        this.codbodegacontrolados = codbodegacontrol
        this.desbodegacontrolados = desbodegacontrol
    }

    public setCodbodegaperi(codbodegacontrol: number) {
        this.codbodegacontrol = codbodegacontrol;
    }
    public getCodbodegacontrol() {
        return this.codbodegacontrol;
    }

    public setDescripcion(desbodegacontrol: string) {
        this.desbodegacontrol = desbodegacontrol;
    }
    public getDesbodegacontrol() {
        return this.desbodegacontrol;
    }
}