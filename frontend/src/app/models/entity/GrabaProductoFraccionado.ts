import { Mensaje } from "./Mensaje";

export class GrabaProductoFraccionado{
    constructor (
      public meinidorig ?: number,
      public meiniddest ?: number,
      public factorconv ?: number,
      public cantidorig ?: number,
      public cantiddest ?: number,
      public codbodega  ?: number,
      public usuario    ?: string,
      public servidor   ?: string,
      public hdgcodigo  ?: number,
      public esacodigo  ?: number,
      public cmecodigo  ?: number,
      public lote       ?: string,
      public fechavto   ?: string,
      public mensaje    ?: Mensaje
    ) {}
}
