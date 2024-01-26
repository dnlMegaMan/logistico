export class GuardarBloqueosBodegasInventario {
  public hdgcodigo: number;
  public esacodigo: number;
  public cmecodigo: number;
  public servidor: string;
  public usuario: string;
  public bloqueos: BloqueoInv[];


  constructor(hdgcodigo: number, esacodigo: number, cmecodigo: number, servidor: string, usuario: string, bloqueos: BloqueoInv[]) {
    this.hdgcodigo = hdgcodigo;
    this.esacodigo = esacodigo;
    this.cmecodigo = cmecodigo;
    this.servidor = servidor;
    this.usuario = usuario;
    this.bloqueos = bloqueos;
  }

}

export class BloqueoInv{
  public bodega: number;
  public accion: string;
  public invpid: number;

  constructor(bodega: number, accion: string, invpid: number) {
    this.bodega = bodega;
    this.accion = accion;
    this.invpid = invpid;
  }
}
