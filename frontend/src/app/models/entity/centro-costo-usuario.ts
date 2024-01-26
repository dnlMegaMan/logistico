export class CentroCostoUsuario {
    constructor (
         public servidor          ?: string,
         public idusuario         ?: number,
         public idcentrocosto     ?: number,
         public hdgcodigo         ?: number,
         public esacodigo         ?: number,
         public cmecodigo         ?: number,
         public glounidadesorganizacionales   ?: string,
         public accion            ?: string,
         public bloqcampogrilla   ?: boolean,
         public marcacheckgrilla  ?: boolean
     ) {}
}