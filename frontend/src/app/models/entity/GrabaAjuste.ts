export class GrabaAjustesInventario {
  constructor(
    public hdgcodigo?: number,
    public esacodigo?: number,
    public cmecodigo?: number,
    public bodegainv?: number,
    public ajustes?: AjustesInventario[],
    public usuario?: string,
    public servidor?: string
  ) { }
}

export class AjustesInventario{
  constructor(
    public iddetalleinven?: number,
    public idinventario?: number, // campo numero oc
    public meinid?: number,
    public codigomein?: string,
    public stockinvent?: number,
    public ajusteinvent?: number, // campo docto a ingresar
    public tipomotivoajus?: number,
    public codigocusm?: string,
    public lote?: string,
    public fechavencimiento?: string,
    public valorcosto?: number
  ){}
}
