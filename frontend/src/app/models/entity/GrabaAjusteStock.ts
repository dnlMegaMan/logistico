export class GrabaAjusteStock{
    constructor (

      public bodegacodigo      ?: number,
      public idmein       ?: number,
      public productocodi   ?: string,
      public bodegastock    ?: number,
      public bodegastocknew ?: number,
      public valorcosto     ?: number,
      public valorcostonew  ?: number,
      public valorventa     ?: number,
      public valorventanew  ?: number,
      public responsable    ?: string,
      public fechaajuste    ?: string, //campo numero oc
      public tipomotivoajus ?: number,
      public usuario        ?: string,
      public servidor       ?: string
    ) {}
}