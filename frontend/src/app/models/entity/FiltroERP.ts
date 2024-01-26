import * as internal from "assert";

export class FiltroERP {
  constructor (
  public servidor            ?: string,
  public tiporeport          ?: string,
  public hdgcodigo           ?: number,
  public esacodigo           ?: number,
  public cmecodigo           ?: number,
  public usuario             ?: string,
  public fechadesde          ?: string,
  public fechahasta          ?: string,
  public movid               ?: number,
  public soliid              ?: number,
  public fechasol            ?: string,
  public codbodegasolicita   ?: number,
  public codbodegasuministro ?: number,
  public codestado           ?: number,
  public referencia          ?: number,
  public receid              ?: number,
  public ctanumcuenta        ?: number,
  public numidentificacion   ?: string,
  public nombrepac           ?: string,
  public codservicio         ?: string,
  public codcentrocosto      ?: number,
  public descripcion         ?: string,
  public observacion         ?: string,
  public opcion              ?: string
  ) { }
}
