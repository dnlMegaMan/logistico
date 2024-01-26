export class Paramgrabardetalletraspaso{ //Se ingresan los campos que se usarán para la grabacion de la de-
    constructor (   //volución de la compra

      public idtraspaso        ?: number, //
      public iddettraspaso     ?: number,
      public meincodmei        ?: string, //
      public meinid            ?: number,
      public cantidadsolic     ?: number,
      public respontraspaso    ?: string,
      public tipotransaccion   ?: string,
      public bodegaorigen      ?: number,
      public bodegadestino     ?: number,
      public servidor          ?: string
    ) {}
}