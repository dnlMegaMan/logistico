import { ParamDetDevolPaciente } from './ParamDetDevolPaciente';

export class Recepciondevolucionpaciente {
    constructor(        
        public hdgcodigo?: number,
        public esacodigo?: number,
        public cmecodigo?: number,
        public servidor?: string,
        public usuariodespacha?: string,
        public ctaid?: number,
        public paramdetdevolpaciente?: Array<ParamDetDevolPaciente>
    ) {}
}