export class RolesUsuarios {
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
        public   accion  ?: string,
        public  bloqcampogrilla?: boolean,
        public  marcacheckgrilla?: boolean,
        public intfin700 ?: string,
        public intconsultasaldo ?: string,
        public intlegado ?: string,
        public intsisalud ?: string,
        ) {

        }
}
