export class ParamGrabaproductosaBodega{ //Se ingresan los campos que se usarán para la grabacion de la de-
    constructor (   //volución de la compra

      public fboidbodega   ?: number, //
      public codbodega      ?: number,
      public meinidprod     ?: number, //
      public puntoasigna    ?: number,
      public puntoreordena  ?: number,
      public stockcritico   ?: number,
      public stockactual    ?: number,
      public usuario        ?: string,
      public servidor       ?: string,
      public nivelreposicion?: number

    ) {}
}