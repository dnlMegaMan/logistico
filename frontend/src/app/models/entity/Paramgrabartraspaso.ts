export class Paramgrabartraspaso{ //Se ingresan los campos que se usarán para la grabacion de la de-
    constructor (   //volución de la compra

      public idtraspaso        ?: number, //
      public servicioorigen    ?: number,
      public serviciodestino   ?: number, //
      public fpreexterno       ?: number,
      public fechatraspaso     ?: string,
      public respontraspaso    ?: string,
      public observtraspaso    ?: string,
      public tipomovimiento    ?: string,
      public bodegaorigen      ?: number,
      public bodegadestino     ?: number,
      public servidor          ?: string
      
    ) {}
}