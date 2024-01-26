import { CentroCostoUsuario } from './centro-costo-usuario';

export class EstructuraCentroCostoUsuario {
        constructor (
             public servidor          ?: string,
             public idusuario         ?: number,
             public idcentrocosto     ?: number,
             public hdgcodigo         ?: number,
             public esacodigo         ?: number,
             public cmecodigo         ?: number,
             public glounidadesorganizacionales   ?: string,
             public accion            ?: string,
             public detalle           ?:CentroCostoUsuario[],
         ) {}
    }
