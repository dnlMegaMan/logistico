import { RolesUsuarios } from "./roles-usuario";

export class Roles {    
    constructor (
        public  servidor        ?: string,
	public  rolid           ?: number,
        public  hdgcodigo       ?: number,
	public  esacodigo       ?: number,
	public  cmecodigo       ?: number,
	public  codigorol       ?: string,
	public  nombrerol       ?: string,
        public  descripcionrol  ?: string,
        public  marcacheckgrilla?: boolean,
        public  rolesusuarios   ?: Array<RolesUsuarios>
    ) {  }
   
}