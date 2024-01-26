export class ReporteImprimeListaConteoInventario {
  public hdgcodigo: number;
  public esacodigo: number;
  public cmecodigo: number;
  public servidor: string;
  public usuario: string;
  public tiporeport: string;
  public bodcodigo: number;
  public tiporeg: string;
  public grupo: number;
  public language: string;


  constructor(
    hdgcodigo: number,
    esacodigo: number,
    cmecodigo: number,
    servidor: string,
    usuario: string,
    tiporeport: string,
    bodcodigo: number,
    tiporeg: string,
    grupo: number,
    language: string
    ) {
    this.hdgcodigo = hdgcodigo;
    this.esacodigo = esacodigo;
    this.cmecodigo = cmecodigo;
    this.servidor = servidor;
    this.usuario = usuario;
    this.tiporeport = tiporeport;
    this.bodcodigo = bodcodigo;
    this.tiporeg = tiporeg;
    this.grupo = grupo;
    this.language = language;
  }
}
