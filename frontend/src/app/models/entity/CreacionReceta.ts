import { DetalleReceta } from './DetalleReceta';

export class CreacionReceta {
    constructor(

        public receid           ?: number,
        public hdgcodigo        ?: number,
        public esacodigo        ?: number,
        public cmecodigo        ?: number,
        public ambito           ?: number,
        public tipo             ?: string,
        public numero           ?: number,
        public subreceta        ?: number,
        public fecha            ?: string,
        public fechaentrega     ?: string,
        public fichapaci        ?: number,
        public ctaid            ?: number,
        public urgid            ?: number,
        public dau              ?: number,
        public clid             ?: number,
        public tipdocpac        ?: number,
        public documpac         ?: string,
        public nombrepaciente   ?: string,
        public tipdocprof       ?: number,
        public documprof        ?: string,
        public nombremedico     ?: string,
        public especialidad     ?: string,
        public rolprof          ?: string,
        public codunidad        ?: string,
        public glosaunidad      ?: string,
        public codservicio      ?: string,
        public glosaservicio    ?: string,
        public codcama          ?: string,
        public camglosa         ?: string,
        public codpieza         ?: string,
        public pzagloza         ?: string,
        public tipoprevision    ?: number,
        public glosaprevision   ?: string,
        public previsionpac     ?: number,
        public glosaprevpac     ?: string,
        public estadoreceta     ?: string,
        public recetadetalle    ?: DetalleReceta[],
        public servidor         ?: string,
        public receobservacion  ?: string,
        public codcobroincluido ?: number,
        public codbodega        ?: number
        
    ) { }   
}