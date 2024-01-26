import { ParamDetDevolPacRechazo } from './ParamDetDevolPacRechazo';

export class ParamDevolPacRechazo {
    constructor(        
        public hdgcodigo        ?: number,
        public esacodigo        ?: number,
        public cmecodigo        ?: number,
        public servidor         ?: string,
        public usuariodespacha  ?: string,
        public ctaid            ?: number,
        public usuariorechaza   ?: string,
        public codambito        ?: number,
        public paramdetdevolpaciente?: Array<ParamDetDevolPacRechazo>
    ) {}
}

