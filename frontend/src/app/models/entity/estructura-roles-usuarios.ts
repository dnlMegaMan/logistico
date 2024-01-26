import { RolesUsuarios } from './roles-usuario';

export class EstructuraRolesUsuarios {
    constructor (
        public  servidor  ?: string,
        public  rolid ?: number,
        public  hdgcodigo ?: number,
        public  esacodigo ?: number,
        public  cmecodigo ?: number,
        public  codigorol ?: string,
        public  nombrerol ?: string,
        public  descripcionrol ?: string,
        public  idusuario    ?:number,
        public  detalle  ?: RolesUsuarios[],
        ) {
            
        }
}

