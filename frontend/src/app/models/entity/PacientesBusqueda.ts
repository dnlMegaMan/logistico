export class PacientesBusqueda{
    constructor (
      public hdgcodigo ?: number,
      public cmecodigo ?: number,
      public tipodocumento ?: number,
      public documentoid ?: string,
      public paterno ?: string,
      public materno ?: string,
      public nombres ?: string,
      public usuario ?: string,
      public servidor ?: string,
    ) {}
}