export class GrabaInventario{
    constructor (

      public iddetalleinven ?: number,
      public idinventario   ?: number, //campo numero oc
      public idmeinid       ?: number,
      public codigomein     ?: string,
      public ajusteinvent   ?: number, //campo docto a ingresar
      public stockinvent    ?: number,
      public conteomanual   ?: number, // precio docto ( valor de la grlla)
      public productodesc   ?: string,
      public usuario        ?: string,
      public servidor       ?: string
    ) {}
}