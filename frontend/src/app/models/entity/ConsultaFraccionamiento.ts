export class ConsultaFraccionado{
    constructor (

      public meinidorig ?: number,
      public meiniddest ?: number, 
      // public factorconv ?: number,
      public factorconversion?: number,
      // public cantidorig ?: number,
      public cantorigen ?: number,
      // public cantiddest ?: number,
      public cantdestino?: number,
      public codbodega  ?: number, 
      public usuario    ?: string,
      public servidor   ?: string,
      public hdgcodigo  ?: number,
      public esacodigo  ?: number,
      public cmecodigo  ?: number,
      public lote       ?: string,
      public fechavto   ?: string,
      public coddestino ?: string,
      public codorigen  ?: string,
      public frmoid     ?: string,
      public marcacheckgrilla?: boolean
      
    ) {}
}