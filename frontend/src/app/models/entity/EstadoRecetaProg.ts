export class EstadoRecetaProg {
    private cantentregas     : number;
    public diasentregadesc: string;
    public diasentregacodigo: string;

    constructor(cantentregas : number,diasentregadesc: string, diasentregacodigo: string) {
        this.cantentregas  = cantentregas ;
        this.diasentregadesc = diasentregadesc;
        this.diasentregacodigo = diasentregacodigo;
    }

    public setIDCantentregas (cantentregas : number) {
        this.cantentregas  = cantentregas;
    }
    public getIdCantentregas () {
        return this.cantentregas;
    }

    public setDiasentregadesc(diasentregadesc: string) {
        this.diasentregadesc = diasentregadesc;
    }
    public getDiasentregadesc() {
        return this.diasentregadesc;
    }

    public setDiasentregacodigo(diasentregacodigo: string) {
      this.diasentregacodigo = diasentregacodigo;
    }

    public getDiasentregacodigo() {
        return this.diasentregacodigo;
    }
}
