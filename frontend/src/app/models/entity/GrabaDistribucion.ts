export class GrabaDistribucion{
    constructor (

      public meinidorig  ?: number,
      public meiniddest  ?: number, //campo numero oc
      public factorconv  ?: number,
      public cantidorig  ?: number, //cantidad a ingresar mismo valor del campo y grilla
      public cantiddest  ?: number,
      public usuario     ?: string,
      public servidor    ?: string             
    ) {}
}