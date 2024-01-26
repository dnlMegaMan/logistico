export class GrabaDevolucionCompra{ //Se ingresan los campos que se usarán para la grabacion de la de-
    constructor (   //volución de la compra

      public occantadevol   ?: number, //campo cantidad a ingresar
      public responsable    ?: string,
      public ocdetmovid     ?: number, //
      public ocdetmovdetid  ?: number,
      public ocdetmeinid    ?: number, // precio docto ( valor de la grlla)
      public ocdetmfdeid    ?: number, // tipo docto factura o guia
      public ocdetnrodocto  ?: string, // valor de la grilla o campo
      public usuario        ?: string,
      public servidor       ?: string
    ) {}
}