import { Mensaje } from "./Mensaje";

export class SolicitudPacienteDevuelta {
    constructor(

        public numsolicitud ?: number,
        public fecsolicitud ?: string,
        public codservicio  ?:string,
        public meinidprod   ?: number,
        public paciente     ?: string,
        public usuarioorig  ?: string,
        public usuariodevol ?: string,
        public mensajes     ?: Mensaje[],
        public fecdevolucion ?: string,
        public numdocpac    ?: string,
        public tipodoc      ?: string,

    ) { }
}
