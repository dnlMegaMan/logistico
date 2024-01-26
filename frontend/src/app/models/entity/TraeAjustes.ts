export class TraeAjustes{
    constructor (
        
      public bodegacodigo   ?: number,
      public bodegadescri   ?: string,
      public productocodi   ?: string,
      public productodesc   ?: string,
      public bodegastock    ?: number,
      public bodegastocknew ?: number,
      public valorcosto     ?: number,
      public valorcostonew  ?: number,
      public valorventa     ?: number,
      public valorventanew  ?: number,
      public responsable    ?: string,
      public fechaajuste    ?: string,
      public tipomotivoajusc?: number,
      public tipomotivoajusd?: string,

    ) {}
}