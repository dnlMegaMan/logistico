export class GrabaRecepcion{
    constructor (

      public orcoid           ?: number,
      public numerodococ      ?: number, //campo numero oc
      public ocdetid          ?: number,
      public fecharecepcion   ?: string, //campo cantidad a ingresar
      public cantidadrecepcion?: number, //cantidad a ingresar mismo valor del campo y grilla
      public responsable      ?: string,
      public numerodocrecep   ?: number, //campo docto a ingresar
      public proveedorid      ?: number,
      public valcostounitario ?: number, // precio docto ( valor de la grlla)
      public tipodoctoid      ?: number, // tipo docto factura o guia
      public fechavencimiento ?: string, // valor de la grilla o campo
      public fechaemisiondoc  ?: string,
      public cantidaddeitems  ?: number,
      public montototaldocto  ?: number,
      public hdgcodigo        ?: number,
      public esacodigo        ?: number,
      public cmecodigo        ?: number,
      public usuario          ?: string,
      public servidor         ?: string           
    ) {}
}